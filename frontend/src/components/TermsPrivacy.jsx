// src/components/TermsPrivacy.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function TermsPrivacy() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 md:p-16 text-gray-800 font-inter">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Terms & Privacy Policy</h1>

        {/* 1. Accessibility */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">1. Accessibility</h2>
          <p className="text-gray-700">
            FirstPoint Cargo is committed to ensuring digital accessibility for all users. 
            We strive to provide an inclusive experience on our website and services.
          </p>
        </section>

        {/* 2. User Agreement */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">2. User Agreement</h2>
          <p className="text-gray-700 mb-2">
            By using FirstPoint Cargo's services, you agree to our terms, including proper use of our platform and compliance with all applicable laws.
          </p>
          <p className="text-gray-700">
            You are responsible for providing accurate information, maintaining confidentiality of login credentials, and complying with all shipping regulations.
          </p>
        </section>

        {/* 3. Privacy Policy */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">3. Privacy</h2>
          <p className="text-gray-700 mb-2">
            We respect your privacy and handle your personal information in accordance with our Privacy Notice. We do not sell your personal data.
          </p>
        </section>

        {/* 4. Consumer Health Data */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">4. Consumer Health Data</h2>
          <p className="text-gray-700 mb-2">
            If you ship health-related products, you must ensure compliance with all applicable health and safety regulations. We do not handle sensitive health data beyond what is necessary for shipping.
          </p>
        </section>

        {/* 5. Payments Terms of Use */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">5. Payments Terms of Use</h2>
          <p className="text-gray-700 mb-2">
            All payments must be processed through authorized methods. You agree to pay all fees associated with your shipments. Payment disputes must be reported immediately.
          </p>
        </section>

        {/* 6. Cookies */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">6. Cookies</h2>
          <p className="text-gray-700 mb-2">
            Our website uses cookies to enhance user experience, analyze traffic, and improve services. You can manage cookies through your browser settings.
          </p>
        </section>

        {/* 7. Data Protection */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">7. Data Protection</h2>
          <p className="text-gray-700 mb-2">
            We implement appropriate security measures to protect your data. However, no method of transmission over the internet is completely secure. We cannot guarantee absolute security.
          </p>
        </section>

        {/* 8. Your Privacy Choices & AdChoice */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">8. Your Privacy Choices & AdChoice</h2>
          <p className="text-gray-700 mb-2">
            You may manage your data preferences, including targeted advertising and marketing communications. We comply with AdChoice and similar frameworks.
          </p>
        </section>

        {/* 9. Prohibited Items */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">9. Prohibited Items</h2>
          <p className="text-gray-700 mb-2">
            We do not ship illegal or restricted items, including but not limited to:
          </p>
          <ul className="list-disc ml-6 text-gray-700 mb-2">
            <li>Drugs or controlled substances</li>
            <li>Drones and UAVs</li>
            <li>Explosives or hazardous materials</li>
            <li>Stolen or counterfeit goods</li>
            <li>Any items prohibited by law or regulations</li>
          </ul>
          <p className="text-gray-700">
            Customers are responsible for ensuring compliance with all applicable laws and regulations for their shipments.
          </p>
        </section>

        {/* 10. Limitation of Liability & Insurance */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">10. Limitation of Liability & Insurance</h2>
          <p className="text-gray-700 mb-2">
            FirstPoint Cargo provides shipping services as a carrier and intermediary. While we strive for safe delivery, we are not liable for any loss, damage, delay, or theft of items during transit, except as required by law.
          </p>
          <p className="text-gray-700 mb-2">
            Clients are strongly encouraged to insure their shipments for valuable or fragile items. We are not responsible for indirect, incidental, or consequential losses.
          </p>
        </section>

        {/* 11. Changes to Terms */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">11. Changes to Terms</h2>
          <p className="text-gray-700">
            We may update these policies from time to time. Continued use of our services constitutes acceptance of updated terms. The latest version will always be available on this page.
          </p>
        </section>

        {/* 12. Contact */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">12. Contact</h2>
          <p className="text-gray-700">
            For questions regarding these policies, please contact |  <a href="mailto:support@firstpointcargo.com" className="text-blue-600 hover:underline">support@firstpointcargo.com</a>.
          </p>
        </section>

        <div className="mt-6 text-center">
          <Link to="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
}