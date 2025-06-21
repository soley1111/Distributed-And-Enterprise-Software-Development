import Navbar from "../components/Navbar";

function NotFound() {
  return (
    <div>
      <Navbar title="404 Not Found" />
      <div>
        <h1>404 Not Found</h1>
        <p>The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}

export default NotFound;