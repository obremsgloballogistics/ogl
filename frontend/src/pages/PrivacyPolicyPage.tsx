import React from 'react';
import SectionHeading from '../components/SectionHeading';

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#F4F7FA] text-[#172B3A] py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <SectionHeading
          title="Privacy Policy"
          subtitle="How OBREMS Global Logistics collects, uses, and protects your personal and cargo information."
        />

        <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6 shadow-sm text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#063B66] mb-2">1. Information We Collect</h2>
            <p>
              When you use OBREMS Global Logistics for shipping, freight forwarding, or tracking services, we collect necessary personal and shipment details including your full name, phone number, email address, physical delivery address, customs declaration information, and parcel tracking metrics.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#063B66] mb-2">2. How We Use Your Information</h2>
            <p>
              Your information is strictly used to facilitate international freight transit (UK ↔ Ghana & China → Ghana), process customs documentation, send SMS/email shipment notifications, verify delivery status, and communicate important updates regarding your cargo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#063B66] mb-2">3. Data Security & Confidentiality</h2>
            <p>
              We implement industry-standard encryption and access controls to secure your personal data. Private customer records, tracking IDs, and customs paperwork are handled with strict confidentiality and stored securely.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#063B66] mb-2">4. Third-Party Carriers & Regulatory Authorities</h2>
            <p>
              We only share relevant cargo data with authorized airlines, sea shipping lines, customs officials (e.g. Ghana Revenue Authority / UK Customs), and local courier delivery personnel strictly necessary to fulfill your freight delivery.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#063B66] mb-2">5. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding our privacy practices, please contact us at <a href="mailto:info@obremsgloballogistics.com" className="text-[#0B63CE] underline">info@obremsgloballogistics.com</a> or +44 7460 554358.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
