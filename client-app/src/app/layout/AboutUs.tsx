// src/components/AboutUs.tsx

import React from 'react';

const AboutUs: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-4">About Us</h1>
            <p className="text-gray-800 leading-relaxed">
                ODASLAB is a company founded in 2014 by computer engineers with complementary backgrounds.
                The IVIOO solution developed and marketed by ODASLAB is the flagship product of the company. IVIOO is a portal that allows for the rapid implementation of a banking performance monitoring and management solution.
            </p>
            <p className="text-gray-800 leading-relaxed mt-4">
                References: IVIOO is currently operational in 3 banks in Africa:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-800">
                <li>Wendkuni BANK International in Burkina Faso</li>
                <li>Bancobu in Burundi</li>
                <li>Nouvelle Banque de Mauritanie in Mauritania</li>
            </ul>
            <p className="text-gray-800 leading-relaxed mt-4">
                Leveraging new technologies, agile methods, and technological watch, ODASLAB aims to ensure the satisfaction of its clients and partners in the banking and financial domain.
                Drawing on experienced experts from the international banking world, ODASLAB assists its clients in organizing and digitalizing their businesses: change management, organization and rationalization of information systems, assistance in project management and project implementation for computerization.
            </p>

            <div className="mt-8 border-t pt-6">
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <div className="flex items-center">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5l9 7-9 7-9-7 9-7z" />
                    
                    <span className="text-gray-800">Phone: +216 98 700 229   </span>
                </div>
                <div className="flex items-center mt-2">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5l9 7-9 7-9-7 9-7z" />
                        

                    <span className="text-gray-800">Email: nejib.ghenima@odaslab.com </span>
                    <div><span className="text-gray-800">Adresse : 69, Rue Abderahmen IBN AOUF - UV4 El Menzah VI - 2091 Tunis</span></div>
                    
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
