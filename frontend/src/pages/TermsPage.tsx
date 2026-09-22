import React from 'react';
import SectionHeading from '../components/SectionHeading';

export default function TermsPage() {
  return (
    <main className="bg-[#F4F7FA] text-[#172B3A] py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <SectionHeading
          title="Terms & Conditions"
          subtitle="Terms of service governing international freight, parcel shipping, and customs clearance with OBREMS Global Logistics."
        />

        <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6 shadow-sm text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#063B66] mb-2">1. Scope of Agreement</h2>
            <p>
              These Terms & Conditions apply to all cargo shipping, air freight, sea freight, and delivery services operated by OBREMS Global Logistics across our UK to Ghana, Ghana to UK, and China to Ghana freight corridors.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#063B66] mb-2">2. Prohibited & Restricted Items</h2>
            <p>
              Customers must ensure that shipments do not contain illegal substances, hazardous materials, explosives, counterfeit goods, or items prohibited by international aviation regulations, UK Customs, or Ghana Customs laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#063B66] mb-2">3. Transit Times & Delivery Schedules</h2>
            <p>
              Estimated transit times (e.g. 3–5 days for Air Freight, 25–35 days for Sea Freight) are approximate and may be subject to airline schedules, port customs processing, or weather conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#063B66] mb-2">4. Customs Duty & Regulatory Fees</h2>
            <p>
              Customs duties and import taxes assessed by government agencies at Accra Kotoka Airport or Tema Seaport are the responsibility of the shipper/consignee unless explicitly included in an agreed door-to-door freight quote.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#063B66] mb-2">5. Claims & Liability</h2>
            <p>
              All claims for loss or damage must be submitted within 7 days of package delivery. Liability is limited in accordance with standard international carriage rules unless optional full cargo insurance was purchased prior to dispatch.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
