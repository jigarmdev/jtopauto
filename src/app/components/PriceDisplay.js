export default function PriceDisplay({ price }) {
  return (
    <div className="mt-4">
      <span className="font-semibold">Estimated Price:</span>{" "}
      <span className="text-green-600 font-bold">₹{price}</span>
    </div>
  );
}
