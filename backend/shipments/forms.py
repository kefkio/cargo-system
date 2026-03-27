from django import forms
from .models import Client, Cargo

class ClientSignupForm(forms.ModelForm):
    class Meta:
        model = Client
        fields = ['name', 'phone', 'email', 'address']

class CargoForm(forms.ModelForm):
    class Meta:
        model = Cargo
        fields = ['client', 'origin', 'destination', 'cargo_type', 'weight', 'dimensions', 'handling_instructions']