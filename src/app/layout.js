import "./globals.css";

export const metadata = {
  title: "EntomoData Pro | Insect Research Catalog",
  description: "A comprehensive academic archive of Thai entomological specimens. This database provides systematic classification, environmental data, and conservation statuses.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background text-on-surface antialiased flex flex-col relative">
        {children}
      </body>
    </html>
  );
}
