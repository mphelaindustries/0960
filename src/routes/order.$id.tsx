import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, MessageCircle, Printer } from "lucide-react";
import { receiptQuery, settingsQuery, useSettings } from "@/lib/catalog";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/store";
import { ReceiptView } from "@/components/receipt";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "Order confirmed — ELIM 0960" },
      { name: "description", content: "Your ELIM 0960 order receipt." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Order confirmed — ELIM 0960" },
      { property: "og:description", content: "Your ELIM 0960 order receipt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context, params }) => {
    const [r] = await Promise.all([
      context.queryClient.ensureQueryData(receiptQuery(params.id)),
      context.queryClient.ensureQueryData(settingsQuery),
    ]);
    if (!r) throw notFound();
  },
  errorComponent: () => <p className="py-24 text-center">Couldn't load this order.</p>,
  notFoundComponent: () => (
    <div className="py-24 text-center">
      <p className="font-display text-5xl">ORDER NOT FOUND</p>
      <Link to="/shop" className="mt-4 inline-block underline">Back to shop</Link>
    </div>
  ),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const receipt = useSuspenseQuery(receiptQuery(id)).data!;
  const settings = useSettings();
  return (
    <section className="mx-auto max-w-3xl px-5 py-12">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h1 className="mt-2 font-display text-6xl leading-none">THANK YOU!</h1>
        <p className="mt-2 text-muted-foreground">
          Order #{receipt.order.order_number} is saved. Send it on WhatsApp so we can confirm payment and delivery.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={whatsappUrl(settings.whatsapp_number, buildWhatsAppMessage(receipt))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-sm bg-success px-6 py-3 text-sm font-bold uppercase tracking-widest text-ink-foreground"
        >
          <MessageCircle className="h-4 w-4" /> Send on WhatsApp
        </a>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-sm border-2 border-secondary px-6 py-3 text-sm font-bold uppercase tracking-widest">
          <Printer className="h-4 w-4" /> Print receipt
        </button>
      </div>
      <div className="mt-8">
        <ReceiptView receipt={receipt} storeName={settings.store_name} />
      </div>
      <p className="mt-6 text-center text-sm">
        <Link to="/shop" className="underline">Continue shopping</Link>
      </p>
    </section>
  );
}
