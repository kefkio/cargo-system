from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from .models import User

# -----------------------------
# General Signup Form (all users)
# -----------------------------
class UserSignupForm(forms.Form):
    ROLE_CHOICES = (
        ('CLIENT', 'Client'),
        ('STAFF', 'Staff'),
        ('ADMIN', 'Admin'),
    )

    full_name = forms.CharField(max_length=255, label="Full Name")
    email = forms.EmailField(label="Email Address")
    phone_number = forms.CharField(max_length=20, label="Phone Number")
    address = forms.CharField(widget=forms.Textarea, label="Address")
    date_of_birth = forms.DateField(widget=forms.DateInput(attrs={"type": "date"}), label="Date of Birth")
    password = forms.CharField(widget=forms.PasswordInput, label="Password")
    password_confirm = forms.CharField(widget=forms.PasswordInput, label="Confirm Password")
    role = forms.ChoiceField(choices=ROLE_CHOICES, label="Role")

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get("password") != cleaned_data.get("password_confirm"):
            raise forms.ValidationError("Passwords do not match")
        return cleaned_data


# -----------------------------
# Admin User Creation Form
# -----------------------------
class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Confirm Password', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'role')

    def clean_password2(self):
        p1 = self.cleaned_data.get('password1')
        p2 = self.cleaned_data.get('password2')
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("Passwords don't match")
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user


# -----------------------------
# Admin User Change Form
# -----------------------------
class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField(label="Password")

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name',
                  'password', 'role', 'is_active', 'is_staff', 'is_superuser',
                  'groups', 'user_permissions')