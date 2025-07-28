import Image from "next/image";
import {
  H1,
  Lead,
  P,
  InlineCode,
  Quote,
  List,
} from "@/components/ui/typography";
import { Section } from "@/components/ui/section";

export default function Home() {
  return (
    <Section>
        <H1>Hello, I’m Anish Shobith P S</H1>
        <Lead>
          A developer who blends curiosity, code, and community to craft
          human-focused software.
        </Lead>
        <P>
          From building Discord bots to exploring the depth of smart energy systems,
          I’ve always believed in learning by doing. My journey into Computer Science
          began with creativity, and evolved through projects, open-source, and the
          pursuit of clean, scalable code.
        </P>
        <P>
          I enjoy working with tools like{" "}
          <InlineCode>TypeScript</InlineCode>,{" "}
          <InlineCode>React</InlineCode>, and{" "}
          <InlineCode>Next.js</InlineCode> to build fast, accessible,
          and delightful interfaces. Lately, I’ve been diving into{" "}
          <InlineCode>IoT</InlineCode>,{" "}
          <InlineCode>AI</InlineCode>, and{" "}
          <InlineCode>compiler design</InlineCode> to expand how I think
          about systems.
        </P>
        <Quote>
          “The best way to predict the future is to invent it.” — Alan Kay
        </Quote>
        <List>
          <li>Full-stack developer with 7+ years of JS experience</li>
          <li>GATE aspirant, lifelong learner</li>
          <li>Cat & dog lover 🐾</li>
          <li>Working on ambitious ideas under <InlineCode>z0id</InlineCode></li>
        </List>
]]
    </Section>
  );
}
