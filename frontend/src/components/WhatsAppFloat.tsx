import { useSiteSettings } from '../hooks/useSiteSettings';

export default function WhatsAppFloat() {
  const { settings } = useSiteSettings();

  const phone = settings?.contactWhatsApp || settings?.contactPhone || '+44 7460 554358';
  const phoneNumber = phone.replace(/[^0-9+]/g, '');

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366] opacity-30 pointer-events-none" />

      <a
        href={`https://wa.me/${phoneNumber}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-transform duration-300 hover:scale-110 active:scale-95"
        style={{ background: 'transparent' }}
      >
        {/* Official WhatsApp logo SVG */}
        <svg
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
          className="w-14 h-14"
        >
          {/* Green bubble background */}
          <circle cx="24" cy="24" r="24" fill="#25D366" />
          {/* White phone-in-speech-bubble icon */}
          <path
            fill="#ffffff"
            d="M24 10.5c-7.456 0-13.5 6.044-13.5 13.5 0 2.38.622 4.613 1.71 6.548L10.5 37.5l7.197-1.683A13.455 13.455 0 0 0 24 37.5c7.456 0 13.5-6.044 13.5-13.5S31.456 10.5 24 10.5zm0 24.75a11.2 11.2 0 0 1-5.72-1.57l-.41-.243-4.272.999 1.03-4.152-.267-.427A11.2 11.2 0 0 1 12.75 24c0-6.213 5.037-11.25 11.25-11.25S35.25 17.787 35.25 24 30.213 35.25 24 35.25z"
          />
          <path
            fill="#ffffff"
            d="M30.262 26.928c-.33-.165-1.953-.964-2.256-1.074-.303-.11-.523-.165-.743.165-.22.33-.853 1.074-1.045 1.294-.192.22-.385.248-.715.083-.33-.165-1.394-.514-2.656-1.64-.982-.875-1.645-1.957-1.838-2.287-.193-.33-.02-.508.145-.673.148-.148.33-.385.495-.578.165-.193.22-.33.33-.55.11-.22.055-.413-.027-.578-.083-.165-.743-1.79-1.018-2.452-.27-.643-.543-.555-.743-.566-.193-.01-.413-.012-.633-.012-.22 0-.578.083-.88.413-.303.33-1.155 1.128-1.155 2.75s1.183 3.19 1.348 3.41c.165.22 2.328 3.556 5.64 4.984.789.34 1.404.544 1.883.696.792.253 1.512.217 2.08.132.635-.095 1.955-.799 2.23-1.571.275-.771.275-1.432.192-1.571-.083-.138-.303-.22-.633-.385z"
          />
        </svg>
      </a>
    </div>
  );
}
