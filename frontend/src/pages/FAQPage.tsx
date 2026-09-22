import { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import api from '../services/api';

const DEFAULT_FAQS = [
  {
    _id: 'faq-1',
    question: 'How can I track my shipment from UK or China to Ghana?',
    answer: 'Enter your tracking code (e.g. OGL245678912UK) into our real-time Tracking tool on the homepage or Tracking page. You will see instant progress across all 9 milestone stages, current location, and estimated arrival.',
  },
  {
    _id: 'faq-2',
    question: 'What is the transit time for Air Freight from London to Accra?',
    answer: 'Air freight from the UK to Accra Kotoka International Airport typically takes between 3 to 5 business days from our London consolidation warehouse dispatch.',
  },
  {
    _id: 'faq-3',
    question: 'How long does Sea & Air shipping take from China to Ghana?',
    answer: 'Sea & Air freight shipping from Guangzhou or Shanghai to Tema Port / Accra takes approximately 15 to 25 days, offering the best balance between cost and speed.',
  },
  {
    _id: 'faq-4',
    question: 'Do you offer door-to-door delivery within Ghana?',
    answer: 'Yes! We handle full door-to-door delivery. Once your goods clear customs at Accra Airport or Tema Harbor, our local courier fleet delivers directly to your office or home anywhere in Accra, Kumasi, Takoradi, and nationwide.',
  },
  {
    _id: 'faq-5',
    question: 'What paperwork or documents are required for customs clearance?',
    answer: 'Standard documentation includes a commercial invoice, packing list, bill of lading / air waybill, and ID. For commercial imports, we assist with HS code classification and Ghana Revenue Authority (GRA) ICUMS clearance.',
  },
  {
    _id: 'faq-6',
    question: 'How is chargeable weight calculated for air cargo?',
    answer: 'Air cargo is charged based on actual gross weight or volumetric weight (L x W x H in cm / 6000), whichever is higher, in accordance with international IATA standards.',
  },
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<any[]>(DEFAULT_FAQS);
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    api
      .get('/faqs')
      .then((response) => {
        if (response.data?.data && response.data.data.length > 0) {
          setFaqs(response.data.data);
        }
      })
      .catch(() => {
        setFaqs(DEFAULT_FAQS);
      });
  }, []);

  const filtered = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="bg-[#F4F7FA] min-h-screen py-12 text-[#172B3A]">
      <div className="container mx-auto px-4 max-w-4xl space-y-10">
        <SectionHeading
          label="FREQUENTLY ASKED QUESTIONS"
          title="Everything You Need to Know"
          description="Find answers regarding our UK and China to Ghana shipping schedules, rates, tracking, customs clearance, and door-to-door deliveries."
        />

        {/* SEARCH CARD */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions by keyword (e.g., transit time, customs, tracking)..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-4 pt-2">
            {filtered.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq._id || idx}
                  className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-[#063B66] text-sm hover:bg-[#F4F7FA] transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-[#0B63CE] shrink-0" />
                      <span>{faq.question}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#0B63CE] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-[#F4F7FA]/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-8">
                No matching questions found for "{search}". Contact our support team for immediate assistance!
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

