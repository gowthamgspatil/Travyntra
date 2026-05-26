import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const destination = searchParams.get("destination");
  const batchId = searchParams.get("batch_id");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md space-y-6"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Booking Confirmed!</h1>
          <p className="text-muted-foreground font-body">
            Your spot has been successfully secured. We've sent a detailed itinerary and confirmation receipt to your email.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild variant="outline">
              <Link to={`/profile`}>View My Bookings</Link>
            </Button>
            <Button asChild className="gap-2">
              <Link to="/packages">
                Explore More <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
