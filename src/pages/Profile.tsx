
import React from 'react';
import { useAuth } from '../App';
import { User, Mail, Phone, MapPin, Globe, Award, ShieldCheck, Heart } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-start space-x-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
      <div className="p-2 bg-white rounded-xl text-ministry-blue shadow-sm">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-gray-700 font-semibold mt-0.5">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[40px] shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="h-48 bg-ministry-blue relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-ministry-gold rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl -ml-20 -mb-20"></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end">
               <div className="flex items-center space-x-6 translate-y-12">
                 <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-ministry-blue text-4xl font-bold">
                        {user.fullName.charAt(0)}
                      </div>
                    )}
                 </div>
                 <div className="pb-4">
                   <h1 className="text-3xl font-display font-bold text-gray-900 drop-shadow-sm">{user.fullName}</h1>
                   <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-0.5 bg-ministry-gold/10 text-ministry-gold text-[10px] font-bold uppercase rounded-full">Member</span>
                      <span className="text-gray-400 text-xs flex items-center">
                        <Globe size={12} className="mr-1" />
                        {user.country}
                      </span>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          <div className="pt-20 p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Details */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-display font-bold text-ministry-blue">Personal Information</h2>
                  <ShieldCheck size={20} className="text-green-500" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <InfoItem icon={Mail} label="Email Address" value={user.email} />
                  <InfoItem icon={Phone} label="Phone Number" value={user.phone} />
                  <InfoItem icon={Globe} label="Country" value={user.country} />
                  <InfoItem icon={User} label="Gender" value={user.gender} />
                  <div className="md:col-span-1">
                    <InfoItem icon={MapPin} label="Residential Address" value={user.address} />
                  </div>
                </div>
              </div>

              {/* Ministry Impact */}
              <div className="space-y-6">
                <h2 className="text-xl font-display font-bold text-ministry-blue">Ministry Interaction</h2>
                <div className="bg-ministry-blue/5 border border-ministry-blue/10 rounded-3xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-ministry-blue text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <Award size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-ministry-blue">Welcome to the Family</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Thank you for registering with Christ Embassy Angola. We are excited to have you as a part of this global vision.
                  </p>
                  <div className="pt-4 flex justify-center space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-ministry-gold text-white text-sm font-bold rounded-xl hover:bg-opacity-90 transition">
                      <Heart size={16} fill="currentColor" />
                      <span>Partner Now</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition">
                      <span>Live Programs</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 text-white rounded-3xl p-6 relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-xs font-bold text-ministry-gold uppercase tracking-widest mb-2">Member Quote</p>
                    <p className="italic text-blue-100/80 text-sm">"Christ in me, the hope of glory. I am living the victorious life every day."</p>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-500">
                    <User size={60} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Your profile information is used for ministry administrative purposes only. 
              <br/>© {new Date().getFullYear()} Christ Embassy Angola.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
