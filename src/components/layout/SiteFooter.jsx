import { Link } from 'react-router-dom';

const footerLinks = [
  { label: 'About ScienceDirect', to: '/about-sciencedirect' },
  { label: 'Remote access', to: '/remote-access' },
  { label: 'Contact and support', to: '/contact-support' },
  { label: 'Terms and conditions', to: '/terms-and-conditions' },
  { label: 'Privacy policy', to: '/privacy-policy' },
  { label: 'Cookie settings', to: '/cookie-settings' },
];

export const SiteFooter = () => (
  <footer className="bg-[#f6f3ee] border-t border-[#ddd4c7] mt-auto">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700">
        {footerLinks.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className="hover:text-brand transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-600 leading-relaxed">
        All content on this site: Copyright © 2026 Elsevier B.V., its licensors, and contributors.
        All rights are reserved.
      </p>
    </div>
  </footer>
);
