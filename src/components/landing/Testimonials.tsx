
import { Star, Quote, ShieldCheck } from "lucide-react";

export const Testimonials = () => {
    const reviews = [
        {
            name: "Priya Sharma",
            role: "Homemaker",
            text: "I used to spend hours going to different shops for groceries. Padosi Mart changed everything! fast delivery and fresh items.",
            rating: 5,
            image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100"
        },
        {
            name: "Rahul Verma",
            role: "Software Engineer",
            text: "The best part is supporting local shopkeepers while getting the convenience of an app. The UI is super smooth and easy to use.",
            rating: 5,
            image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100"
        },
        {
            name: "Anita Desai",
            role: "Student",
            text: "Late night study snacks or urgent stationery - Padosi Mart has saved me multiple times. Trusted service!",
            rating: 4.8,
            image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100"
        }
    ];

    return (
        <section className="py-20 bg-white dark:bg-gray-950">
            <div className="container">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 text-orange-600 font-semibold mb-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full text-sm">
                            <ShieldCheck className="w-4 h-4" />
                            Trusted by Community
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Loved by your Neighbors
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            Don't just take our word for it. Here's what our community verified users have to say.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`, backgroundSize: 'cover' }}></div>
                            ))}
                        </div>
                        <div>
                            <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">4.9/5 from 2k+ reviews</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, idx) => (
                        <div
                            key={idx}
                            className="group relative bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-900 transition-all duration-300 hover:-translate-y-1"
                        >
                            <Quote className="absolute top-8 right-8 w-10 h-10 text-gray-100 dark:text-gray-800 group-hover:text-orange-500/10 transition-colors" />

                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(review.rating) ? "fill-orange-400 text-orange-400" : "fill-gray-200 text-gray-200"}`} />
                                ))}
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed relative z-10">
                                "{review.text}"
                            </p>

                            <div className="flex items-center gap-4">
                                <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800 group-hover:ring-orange-200 transition-all" />
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{review.name}</h4>
                                    <p className="text-xs text-gray-500">{review.role} • Verified Buyer</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
