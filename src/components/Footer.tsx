import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMapPin, FiPhone, FiMail, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 pt-16 pb-8 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image 
                src="/images/ShreejiLogo.png" 
                alt="Shreeji International" 
                width={180} 
                height={60}
                className="h-14 w-auto"
              />
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your trusted partner for premium Indian wholesale groceries, 
              delivering quality products for businesses and bulk buyers.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="https://facebook.com" icon={<FiFacebook />} label="Facebook" />
              <SocialLink href="https://instagram.com" icon={<FiInstagram />} label="Instagram" />
              <SocialLink href="https://twitter.com" icon={<FiTwitter />} label="Twitter" />
            </div>
          </div>

          {/* Business Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Business</h3>
            <ul className="space-y-2">
              <FooterLink href="/auth/register" label="Create Account" />
              <FooterLink href="/products" label="Browse Products" />
              <FooterLink href="/contact" label="Contact Us" />
              <FooterLink href="/about" label="About Us" />
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiMapPin className="h-5 w-5 text-lime-500 dark:text-lime-400 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">
                  1162 Security Dr, Dallas, TX 75247
                </span>
              </li>
              <li className="flex items-center">
                <FiPhone className="h-5 w-5 text-lime-500 dark:text-lime-400 mr-3 flex-shrink-0" />
                <a href="tel:+12145297974" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 dark:hover:text-lime-400 transition-colors">
                  (214) 529-7974
                </a>
              </li>
              <li className="flex items-center">
                <FiMail className="h-5 w-5 text-lime-500 dark:text-lime-400 mr-3 flex-shrink-0" />
                <a href="mailto:shreejidallas1@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 dark:hover:text-lime-400 transition-colors">
                  shreejidallas1@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {currentYear} Shreeji International. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy-policy" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 dark:hover:text-lime-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 dark:hover:text-lime-400 text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Footer Link Component
const FooterLink = ({ href, label }: { href: string; label: string }) => {
  return (
    <li>
      <Link 
        href={href} 
        className="text-gray-600 dark:text-gray-400 hover:text-lime-500 dark:hover:text-lime-400 transition-colors"
      >
        {label}
      </Link>
    </li>
  );
};

// Social Link Component
const SocialLink = ({ 
  href, 
  icon, 
  label 
}: { 
  href: string; 
  icon: React.ReactNode;
  label: string;
}) => {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-lime-500 dark:hover:bg-lime-600 hover:text-white dark:hover:text-white hover:border-lime-500 dark:hover:border-lime-600 transition-all transform hover:-translate-y-1"
      aria-label={label}
    >
      {icon}
    </a>
  );
};

export default Footer;