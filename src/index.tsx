import { createRoot } from "react-dom/client";

const styles = {
  container: {
    fontFamily: "system-ui, sans-serif",
    padding: "2rem",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  text: {
    color: "#666",
  },
};

const App = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Привет, мир!</h1>
      <p style={styles.text}>Редактируйте этот файл.</p>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
