import { Link } from "react-router";

export default function Unauthorized() {
  return (
    <div>
      <h1 className="text-6xl text-center text-red-500">
        You Are not Authorized to access this data
      </h1>
      <Link to="/">Home</Link>
    </div>
  );
}
