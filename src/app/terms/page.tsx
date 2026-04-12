import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — AuraFits",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-20 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 transition hover:text-zinc-900"
        >
          &larr; Back
        </Link>

        <h1 className="mt-8 text-3xl font-serif font-light text-zinc-900 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-zinc-400">Last updated: April 12, 2026</p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-zinc-600">
          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              Acceptance of Terms
            </h2>
            <p className="mt-3">
              By accessing and using AuraFits, you agree to be bound by these Terms of Service.
              If you do not agree with any part of these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              Service Description
            </h2>
            <p className="mt-3">
              AuraFits is an AI-powered personal styling platform that provides outfit
              recommendations based on your body analysis and style preferences. Our service is
              currently in early access and features may change without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              User Content
            </h2>
            <p className="mt-3">
              By uploading photos or providing information through AuraFits, you grant us a
              limited, non-exclusive right to process that content solely for the purpose of
              delivering styling recommendations. You retain all rights to your content.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              Product Recommendations
            </h2>
            <p className="mt-3">
              AuraFits recommends products from third-party brands and retailers. We are not
              responsible for the availability, pricing, quality, or fulfillment of any products
              shown. Product links direct you to external stores where separate terms apply.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              Accuracy
            </h2>
            <p className="mt-3">
              Our AI-powered body analysis and styling recommendations are estimates and should
              be treated as suggestions. Results may vary based on photo quality, lighting, and
              other factors. We do not guarantee fit or satisfaction with recommended products.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              Prohibited Use
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Uploading photos of other people without their consent</li>
              <li>Attempting to reverse-engineer or extract our AI models</li>
              <li>Using the service for any unlawful purpose</li>
              <li>Scraping or automated access to the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              Limitation of Liability
            </h2>
            <p className="mt-3">
              AuraFits is provided &ldquo;as is&rdquo; without warranties of any kind. We shall not be
              liable for any indirect, incidental, or consequential damages arising from your
              use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              Changes to Terms
            </h2>
            <p className="mt-3">
              We reserve the right to modify these terms at any time. Continued use of AuraFits
              after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              Contact
            </h2>
            <p className="mt-3">
              For questions about these terms, contact us at{" "}
              <a href="mailto:legal@aurafits.ca" className="text-zinc-900 underline underline-offset-2">
                legal@aurafits.ca
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
