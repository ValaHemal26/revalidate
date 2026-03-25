import Link from "next/link";
import ErrorMessage from "../components/ErrorMessage";

export default function BookingPage() {
  return (
    <>
      <ErrorMessage message="Please select source, destination and travel date to continue Booking" />
      <Link href="/buses">Click Here</Link> to select travel details
    </>
  );
}