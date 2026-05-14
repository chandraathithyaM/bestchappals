import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8faff 0%, #fafafa 50%, #f0fdf4 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        paddingTop: "calc(72px + 2rem)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#6b7280",
            marginBottom: "0.5rem",
          }}
        >
          BestChappals Account
        </p>
        <h1
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 900,
            fontSize: "1.8rem",
            color: "#111",
            marginBottom: "1.5rem",
          }}
        >
          Create Account
        </h1>
        <SignUp />
      </div>
    </div>
  );
}
