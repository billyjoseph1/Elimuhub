'use client'
import Link from 'next/link';
import { 
  BookOpen, 
  Target, 
  BarChart2, 
  Clock, 
  Users, 
  MessageSquare 
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        {/* Content */}
        <div className="relative py-20 px-6">
          <header className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 animate-title">
              ElimuHub
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed animate-slide-up">
              Your personalized companion for academic success! Track your progress, set goals, and achieve more.
            </p>
          </header>

          {/* Call to Action */}
          <section className="text-center mb-20">
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                href="/login"
                className="group relative inline-flex items-center px-8 py-3 overflow-hidden rounded-full bg-blue-600 text-white transition-all hover:bg-blue-800"
              >
                <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                <span className="relative font-semibold text-lg">Login</span>
              </Link>
              <Link
                href="/register"
                className="group relative inline-flex items-center px-8 py-3 overflow-hidden rounded-full bg-green-600 text-white transition-all hover:bg-green-800"
              >
                <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                <span className="relative font-semibold text-lg">Register</span>
              </Link>
            </div>
          </section>

          {/* Features */}
          <section className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
              Why Choose ElimuHub?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: BookOpen, title: 'Track Progress', description: 'Monitor your scores across all subjects and assignments' },
                { icon: Target, title: 'Set Goals', description: 'Set and achieve your academic objectives' },
                { icon: BarChart2, title: 'Visualize Data', description: 'See your progress through intuitive charts' },
                { icon: Clock, title: 'Stay on Schedule', description: 'Get reminders for upcoming assignments' },
                { icon: Users, title: 'Peer Comparison', description: 'Compare performance with peers' },
                { icon: MessageSquare, title: 'Receive Feedback', description: 'Get valuable insights from teachers' },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} ElimuHub. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Add necessary styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes title {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-title {
          animation: title 1s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
          animation-delay: 0.2s;
          opacity: 0;
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}