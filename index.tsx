import { ComponentChildren } from "preact";

export const layout = "layout.vto";

export default function IndexPage(data: Lume.Data) {
  return (
    <>
      <div class="bg-blue-50">
        <div class="mx-auto max-w-screen-md">
          <Head />
          <section class="p-4 max-w-screen-lg mx-auto sm:mt-2 md:mt-4 lg:mt-8 text-lg md:text-xl lg:text-2xl space-y-4">
            <AdParagraph>
              MessageFormat 2.0 is a Unicode standard for localizable dynamic
              message strings, designed to make it simple to create{" "}
              <b>natural sounding</b> localized messages.
            </AdParagraph>
            {
              /* <AdParagraph>
          MF2 messages support <b>genders</b>, <b>pluralization rules</b>, and
          {" "}
          <b>gramatical cases</b>{" "}
          for translations, even when the source language doesn't have these
          features.
        </AdParagraph>
        <AdParagraph>
          MF2 understands formattable data such as <b>dates</b>, <b>times</b>,
          {" "}
          <b>numbers</b>, <b>currencies</b>, and{" "}
          <b>units</b>, so that such data can be formatted in a
          locale-appropriate way.
        </AdParagraph>
        <AdParagraph>
          Markup and text can be <b>mixed</b>{" "}
          in a single message, allowing for richly formatted localized messages,
          without tying the translation to the source language's structure.
        </AdParagraph> */
            }
            <div class="pt-4 md:pt-8 flex flex-wrap gap-4 md:gap-6">
              <a
                href="/why"
                class="inline-block px-6 md:px-8 py-3 md:py-4 text-lg font-bold text-white rounded-full bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 active:from-blue-700 active:to-blue-500 focus:from-blue-700 focus:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
              >
                Learn more
              </a>
              <a
                href="/docs"
                class="inline-block px-6 md:px-8 py-3 md:py-4 text-lg font-bold text-blue-600 rounded-full bg-blue-100 hover:bg-blue-200 active:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
              >
                Documentation
              </a>
            </div>
          </section>
        </div>
        <svg
          class="w-full mt-8 fill-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 100"
        >
          <path d="M0 0 Q 500 100 1000 0 L 1000 100 L 0 100 Z" />
        </svg>
      </div>
      <div class="mx-auto max-w-screen-md">
        <Examples />
      </div>
    </>
  );
}

export function Head() {
  return (
    <header class="w-full pt-6 sm:pt-8 md:pt-10 lg:pt-20 px-4 max-w-screen-lg mx-auto">
      <h1 class="block text-4xl md:text-5xl lg:text-6xl lg:leading-tighter tracking-tight md:tracking-tighter font-serif font-bold">
        MessageFormat 2
      </h1>
      <p class="block text-xl md:text-2xl lg:text-3xl">
        A full featured localization system, from Unicode.
      </p>
    </header>
  );
}

export function AdParagraph(props: { children: ComponentChildren }) {
  return (
    <p class="max-w-4xl">
      {props.children}
    </p>
  );
}

export function Examples() {
  return (
    <Example>
      <ExampleProse title="Free form interpolation">
        <p>
          MessageFormat 2 messages can contain variables, which are replaced
          with values at runtime.
        </p>
        <p>
          Variables can be moved around in the message freely, allowing
          translations even to languages where sentence structure doesn't match
          the source.
        </p>
      </ExampleProse>
      <ReplacementVariableCode />
    </Example>
  );
}

function ReplacementVariableCode() {
  return (
    <div class="space-y-1 pt-6 -mx-4 md:mx-0">
      <div class="relative">
        <div
          id="replacement-var-desc"
          class="absolute -top-[60%] left-[12.5rem] text-nowrap font-handwritten text-lg px-2"
        >
          a replacement variable
        </div>
        <CodeBlock>
          Your name is {"{"}
          <span id="replacement-var-target" class="text-violet-600">
            $name
          </span>
          {"}"}.
        </CodeBlock>
      </div>
      <div class="text-2xl flex justify-center">
        <svg
          class="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <CodeBlock>
        <span class="text-red-600">let</span>{" "}
        <span class="text-violet-600">name</span> ={" "}
        <span class="relative">
          <span class="relative inline-block text-orange-500" id="name1">
            "<span>Alice</span>"
          </span>
        </span>
      </CodeBlock>
      <div class="flex justify-center items-center">
        <svg
          class="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          >
          </path>
        </svg>
      </div>
      <div class="border-y md:border-x md:rounded-md p-6 text-lg">
        Hello{" "}
        <span class="relative">
          <span class="text-orange-600 relative inline-block" id="name2">
            Alice
          </span>
        </span>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
    document.addEventListener('DOMContentLoaded', function() {
    document.fonts.ready.then(() => {

new LeaderLine(
document.getElementById('replacement-var-desc'),
document.getElementById('replacement-var-target'),
{ hide: true, path: "magnet", endSocket: "top", startSocket: "left", color: "rgba(0, 0, 0, 0.5)", size: 3 } 
).show("draw");

const name1 = document.getElementById('name1');
const name2 = document.getElementById('name2');
const names = ['Alice', 'Bob', 'Charlie'];

let i = 0;
setInterval(() => {
i++;

name1.style.animation = 'slideFadeOut .3s forwards';
name1.addEventListener('animationend', () => {
name1.children[0].textContent = names[i % names.length];
name1.style.animation = 'slideFadeIn .6s forwards';

name1.addEventListener('animationend', () => {
name1.style.animation = '';
}, { once: true });
}, { once: true });

name2.style.animation = 'slideFadeOut .3s forwards';
name2.addEventListener('animationend', () => {
name2.textContent = names[i % names.length];
name2.style.animation = 'slideFadeIn .6s forwards';

name2.addEventListener('animationend', () => {
name2.style.animation = '';
}, { once: true });
}, { once: true });
}, 4000);

});
});
`,
        }}
      />
    </div>
  );
}

function Example(props: { children: ComponentChildren }) {
  return (
    <section class="mt-16 grid md:grid-cols-2 gap-12 mb-48 px-4">
      {props.children}
    </section>
  );
}

function ExampleProse(
  props: { title: string; children: ComponentChildren },
) {
  return (
    <div>
      <h3 class="font-serif font-bold text-2xl md:text-3xl">
        {props.title}
      </h3>
      <div class="text-lg md:text-xl leading-7 mt-4 space-y-6">
        {props.children}
      </div>
    </div>
  );
}

function CodeBlock(
  props: { class?: string; label?: string; children: ComponentChildren },
) {
  return (
    <pre class={`bg-gray-100 p-4 md:rounded-lg relative ${props.class ?? ""}`}>
      <span class="absolute -top-3 left-2 bg-gray-50 rounded-t px-2 text-xs">
        {props.label}
      </span>
      <code>{props.children}</code>
    </pre>
  );
}
