"use client";

export default function Page() {
  return (
    <div className="max-w-4xl">
      {/* HERO */}
      <section className="mb-40">
        <h2 className="text-5xl font-bold mb-6">Introduction</h2>
        <p className="text-lg text-white/70 leading-relaxed">
          I design and build high-performance web experiences with a focus on
          clarity, motion, and precision. My work blends engineering and design
          to create interfaces that feel effortless.
        </p>
      </section>

      {/* ABOUT */}
      <section className="mb-40">
        <h2 className="text-4xl font-semibold mb-8">About</h2>

        <h3 className="text-2xl font-medium mb-4">Background</h3>
        <p className="text-white/70 mb-8 leading-relaxed">
          With a strong foundation in frontend engineering, I specialize in
          React, animation systems, and modern web architecture. I enjoy
          crafting systems that are scalable, maintainable, and elegant.
        </p>

        <h3 className="text-2xl font-medium mb-4">Philosophy</h3>
        <p className="text-white/70 leading-relaxed">
          Simplicity scales. Every interface should communicate hierarchy,
          motion, and structure clearly. I focus on building experiences that
          feel intuitive and natural.
        </p>
      </section>

      {/* EXPERIENCE */}
      <section className="mb-40">
        <h2 className="text-4xl font-semibold mb-8">Experience</h2>

        <h3 className="text-2xl font-medium mb-4">Senior Frontend Engineer</h3>
        <p className="text-white/70 mb-8 leading-relaxed">
          Led development of high-traffic web applications, optimized rendering
          performance, and built reusable design systems used across multiple
          products.
        </p>

        <h3 className="text-2xl font-medium mb-4">UI Systems Architect</h3>
        <p className="text-white/70 leading-relaxed">
          Designed motion systems, scroll interactions, and component libraries
          that improved consistency and reduced engineering overhead.
        </p>
      </section>

      {/* PROJECTS */}
      <section className="mb-40">
        <h2 className="text-4xl font-semibold mb-8">Projects</h2>

        <h3 className="text-2xl font-medium mb-4">
          Interactive Documentation Platform
        </h3>
        <p className="text-white/70 mb-8 leading-relaxed">
          Built a dynamic documentation system with auto-generated navigation,
          smooth scroll tracking, and contextual highlighting.
        </p>

        <h3 className="text-2xl font-medium mb-4">Motion Design Portfolio</h3>
        <p className="text-white/70 mb-8 leading-relaxed">
          Developed a highly animated portfolio using SVG path tracking and
          scroll-based progress interactions.
        </p>

        <h3 className="text-2xl font-medium mb-4">SaaS Dashboard UI</h3>
        <p className="text-white/70 leading-relaxed">
          Created modular dashboard components with complex data visualization
          and interaction patterns.
        </p>
      </section>

      {/* CONTACT */}
      <section className="mb-40">
        <h2 className="text-4xl font-semibold mb-8">Contact</h2>

        <h3 className="text-2xl font-medium mb-4">Let’s Work Together</h3>
        <p className="text-white/70 leading-relaxed">
          If you're building something ambitious and need a frontend engineer
          who cares about detail, motion, and performance — let’s talk.
        </p>
      </section>
    </div>
  );
}
