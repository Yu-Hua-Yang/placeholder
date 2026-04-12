import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — AuraFits",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-400">Last updated: April 12, 2026</p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-zinc-600">
          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              What We Collect
            </h2>
            <p className="mt-3">
              When you use AuraFits, we may collect the following information:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Photos you upload for body analysis (processed in real-time and not permanently stored)</li>
              <li>Style preferences and responses you provide during the styling session</li>
              <li>Email address, if you choose to provide one</li>
              <li>Basic usage data such as pages visited and session duration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              How We Use Your Data
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>To generate personalized outfit recommendations based on your body type and style preferences</li>
              <li>To improve our AI styling models and recommendation accuracy</li>
              <li>To send you your results and occasional product updates (only if you provide your email)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              Photo Privacy
            </h2>
            <p className="mt-3">
              Your photos are used solely for real-time body analysis. They are processed by our AI
              models to determine body proportions, skin tone, and style characteristics. Photos are
              not stored on our servers after analysis is complete and are never shared with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              Third-Party Services
            </h2>
            <p className="mt-3">
              We use third-party services to power parts of AuraFits, including AI model providers
              and analytics tools. These services process data in accordance with their own privacy
              policies. We do not sell your personal data to any third party.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              Cookies
            </h2>
            <p className="mt-3">
              We use minimal cookies and local storage to maintain your session state during the
              styling experience. We do not use tracking cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              Your Rights
            </h2>
            <p className="mt-3">
              You can request deletion of any data associated with your email address at any time
              by contacting us. You may also choose not to provide an email, in which case no
              personally identifiable information is retained.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-900">
              Contact
            </h2>
            <p className="mt-3">
              For any privacy-related questions, reach out to us at{" "}
              <a href="mailto:privacy@aurafits.ca" className="text-zinc-900 underline underline-offset-2">
                privacy@aurafits.ca
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
