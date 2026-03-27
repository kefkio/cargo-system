from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from shipments.models import Invoice


class Command(BaseCommand):
    help = (
        "Expire proforma invoices older than 2 weeks (still 'issued') and retire "
        "proformas superseded by a final invoice on the same shipment."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=14,
            help="Number of days after which an issued proforma expires (default: 14).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Preview which proformas would be expired/retired without making changes.",
        )

    def handle(self, *args, **options):
        days = options["days"]
        cutoff = timezone.now() - timedelta(days=days)

        if options["dry_run"]:
            stale = Invoice.objects.filter(
                invoice_type="proforma",
                status="issued",
                issued_at__lt=cutoff,
            )
            from django.db.models import Exists, OuterRef
            has_active_final = Invoice.objects.filter(
                cargo=OuterRef("cargo"),
                invoice_type="final",
            ).exclude(status="cancelled")
            to_retire = Invoice.objects.filter(
                invoice_type="proforma",
                status__in=("draft", "issued"),
            ).filter(Exists(has_active_final))

            self.stdout.write(
                f"[dry-run] Would expire {stale.count()} proforma(s) issued before {cutoff.date()}."
            )
            for inv in stale[:20]:
                self.stdout.write(f"  EXPIRE  {inv.invoice_number}  issued {inv.issued_at.date()}  cargo {inv.cargo.tracking_number}")

            self.stdout.write(
                f"[dry-run] Would retire {to_retire.count()} proforma(s) superseded by a final invoice."
            )
            for inv in to_retire[:20]:
                self.stdout.write(f"  RETIRE  {inv.invoice_number}  cargo {inv.cargo.tracking_number}")
            return

        expired, retired = Invoice.expire_stale_proformas(days=days)
        self.stdout.write(self.style.SUCCESS(
            f"Done: expired {expired} proforma(s), retired {retired} superseded proforma(s)."
        ))
