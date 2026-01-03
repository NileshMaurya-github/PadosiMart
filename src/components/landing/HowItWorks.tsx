
import { MapPin, ShoppingBag, Truck } from "lucide-react";

export const HowItWorks = () => {
    const steps = [
        {
            icon: <MapPin className="w-8 h-8 text-white" />,
            title: "1. Locate Nearby Shops",
            desc: "Enter your location to see verified local stores in your neighborhood.",
            color: "from-blue-400 to-blue-600",
            shadow: "shadow-blue-500/30"
        },
        {
            icon: <ShoppingBag className="w-8 h-8 text-white" />,
            title: "2. Choose & Order",
            desc: "Browse products, compare prices, and add to cart instantly.",
            color: "from-orange-400 to-orange-600",
            shadow: "shadow-orange-500/30"
        },
        {
            icon: <Truck className="w-8 h-8 text-white" />,
            title: "3. Swift Delivery",
            desc: "Get your essentials delivered to your doorstep in minutes.",
            color: "from-green-400 to-green-600",
            shadow: "shadow-green-500/30"
        }
    ];

    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
            <div className="container">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        How Padosi Mart Works
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Experience the easiest way to shop from your local marketplace.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, idx) => (
                        <div
                            key={idx}
                            className="relative group bg-white dark:bg-gray-800 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
                        >
                            {/* Floating 3D Icon Container */}
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} shadow-lg ${step.shadow} flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                {step.icon}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                {step.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                {step.desc}
                            </p>

                            {/* Decorative Number Background */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gray-50 dark:bg-gray-700/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 flex items-center justify-center text-6xl font-black text-gray-200 dark:text-gray-600 select-none">
                                {idx + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
