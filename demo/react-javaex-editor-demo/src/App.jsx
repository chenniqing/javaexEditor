import { useEffect, useMemo, useState } from "react";
import { pages } from "./pages/index.js";

function getHashPageKey() {
  return (location.hash || "#default").slice(1);
}

export default function App() {
  const [pageKey, setPageKey] = useState(getHashPageKey);
  const currentPage = useMemo(() => pages.find((page) => page.key === pageKey) || pages[0], [pageKey]);
  const CurrentPage = currentPage.component;

  useEffect(() => {
    const onHashChange = () => setPageKey(getHashPageKey());
    window.addEventListener("hashchange", onHashChange);
    if (!location.hash) {
      location.hash = "#default";
      setPageKey("default");
    } else {
      onHashChange();
    }
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <main className="demo-shell">
      <aside className="demo-sidebar">
        <div className="demo-brand">
          <p>React 示例</p>
          <h1>javaexEditor</h1>
        </div>
        <nav className="demo-nav" aria-label="示例页面">
          {pages.map((page) => (
            <a key={page.key} href={`#${page.key}`} className={page.key === currentPage.key ? "is-active" : ""}>
              {page.title}
            </a>
          ))}
        </nav>
      </aside>
      <section className="demo-main">
        <CurrentPage key={currentPage.key} page={currentPage} />
      </section>
    </main>
  );
}
