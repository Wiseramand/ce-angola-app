
import React from 'react';

const Founder: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="lg:w-1/2 sticky top-28">
            <div className="relative group">
              <div className="absolute -inset-4 bg-ministry-gold/10 rounded-3xl blur-2xl group-hover:bg-ministry-gold/20 transition duration-500"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src="assets/pastor-chris.jpg" 
                  alt="Rev. Dr. Chris Oyakhilome" 
                  className="w-full aspect-[4/5] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "assets/pastor-chris.jpg";
                  }}
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-ministry-blue text-white p-8 rounded-3xl shadow-xl border-4 border-ministry-gold max-w-xs hidden md:block">
                 <p className="italic text-lg font-light leading-relaxed">
                   "Your life is the expression of your mind. To change your life, you must change your mind."
                 </p>
                 <p className="mt-4 font-bold text-ministry-gold uppercase tracking-widest text-sm">— Rev. Chris Oyakhilome</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 space-y-10">
            <div>
              <span className="text-ministry-gold font-bold uppercase tracking-widest text-sm mb-4 block">Meet the Man of God</span>
              <h1 className="text-4xl md:text-6xl font-display font-extrabold text-ministry-blue leading-tight">Rev. (Dr.) Chris Oyakhilome</h1>
              <div className="w-20 h-2 bg-ministry-gold mt-6"></div>
            </div>

            <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
              <p className="text-xl font-medium text-gray-800 leading-relaxed">
                Rev. Dr. Chris Oyakhilome is the President of LoveWorld Inc., a global ministry with a mandate to reach the nations of the world with the message of God's divine life.
              </p>
              <p>
                As a pastor, teacher, healing minister, television host, and best-selling author, Pastor Chris has helped millions experience a victorious and purposeful life in God's Word. His ministry spans over 30 years and has impacted lives across all continents through various platforms.
              </p>
              
              <h3 className="text-2xl font-display font-bold text-ministry-blue pt-4">Early Calling and Spiritual Journey</h3>
              <p>
                Starting as a youth leader and preacher during his university days, Pastor Chris pioneered a campus fellowship that grew into what is today the global LoveWorld ministry. His deep commitment to the Holy Spirit and the authority of God's Word became the foundation for the ministry's explosive growth.
              </p>

              <h3 className="text-2xl font-display font-bold text-ministry-blue pt-4">The Healing School and Satellite TV</h3>
              <p>
                He is the founder of the world-renowned Healing School, a ministry that manifests the healing works of Jesus Christ today. Additionally, he pioneered the first 24-hour Christian satellite network from Africa to the rest of the world, leading to the birth of LoveWorld networks globally.
              </p>

              <h3 className="text-2xl font-display font-bold text-ministry-blue pt-4">Rhapsody of Realities</h3>
              <p>
                His daily devotional, Rhapsody of Realities, is currently the most translated book in the world, available in over 7,000 languages. This messenger angel has brought the light of the Gospel to remote regions, cities, and nations, becoming a key tool for global evangelism.
              </p>

              <div className="bg-gray-50 p-8 rounded-2xl border-l-8 border-ministry-gold italic text-gray-700 font-medium">
                "We are taking God's presence to the nations of the world and demonstrating the character of the Spirit."
              </div>
              
              <p>
                Today, Christ Embassy Angola stands as a vibrant testimony to this global vision, establishing thousands of souls in the reality of their heritage in Christ Jesus under his apostolic leadership.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Founder;
