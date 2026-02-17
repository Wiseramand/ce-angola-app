
import React from 'react';
import { Facebook, Instagram, Youtube, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-ministry-blue text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <Logo className="h-20 w-auto self-start filter brightness-110 drop-shadow-lg" />
              <h3 className="font-display font-bold text-xl border-b-2 border-ministry-gold pb-2 inline-block">CE Angola</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Spreading the gospel of our Lord Jesus Christ in the city of Luanda and across all the provinces of Angola. Bringing hope to millions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-ministry-gold hover:text-white transition"><Facebook size={20} /></a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-ministry-gold hover:text-white transition"><Instagram size={20} /></a>
              <a href="https://www.youtube.com/@christembassyangola-groupp2059 target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-ministry-gold hover:text-white transition"><Youtube size={20} /></a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-ministry-gold hover:text-white transition"><Twitter size={20} /></a>
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-ministry-gold">Quick Links</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-transform inline-block">Live TV</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-transform inline-block">Healing School</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-transform inline-block">InnerCity Mission</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-transform inline-block">Partnerships</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-ministry-gold">Support</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-transform inline-block">Online Giving</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-transform inline-block">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-transform inline-block">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-transform inline-block">Contact Us</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg mb-6 text-ministry-gold">Contact Info</h3>
            <div className="flex items-start space-x-3 text-sm text-gray-300">
              <MapPin size={18} className="text-ministry-gold mt-1 flex-shrink-0" />
              <span>Belas, Luanda, Angola</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <Phone size={18} className="text-ministry-gold flex-shrink-0" />
              <span>+244 923 000 000</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <Mail size={18} className="text-ministry-gold flex-shrink-0" />
              <span>info@ceangola.org</span>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Christ Embassy Angola. All rights reserved. Registered Religious Entity.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
