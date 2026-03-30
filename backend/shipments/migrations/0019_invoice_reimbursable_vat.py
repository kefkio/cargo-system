from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("shipments", "0018_add_dispatch_handler_and_cost"),
    ]

    operations = [
        migrations.AddField(
            model_name="invoice",
            name="reimbursable_vat",
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                help_text="Reimbursable VAT charged to cargo owner",
                max_digits=12,
            ),
        ),
    ]
