import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Subscription Reminder",
  description: "Never miss a subscription payment again",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
