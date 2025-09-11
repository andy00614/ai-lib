
export function buildPrompt(topic: string) {

    return `You are an illustrator creating a fun and educational infographic in a simple flat cartoon style.

Style:
- Flat, minimalistic, playful cartoon.
- Clean white background.
- Use bold pastel colors (yellow, green, blue, gray).
- Strong black outlines with light soft shadows.
- Characters are expressive, with cartoon humor (banana professor with glasses, talking tree, funny sun, etc.).
- Consistent palette and stroke style across all panels.

Layout:
- Divide the canvas into **5 clear horizontal panels**.
- Place a big bold title at the top: “WHY ${topic.toUpperCase()}?”
- Each panel has a short label (1–2 words only).

Content (5 steps about ${topic}):
1. **Introduction** → introduce ${topic} in a playful scene.
2. **Scene** → show what is happening around ${topic}.
3. **Cause** → illustrate the main trigger of ${topic}, with mascots explaining.
4. **Effect** → show the direct effects of ${topic}.
5. **Consequence** → present the final outcome of ${topic}, with emotional character reactions.

Extra touches:
- Add small icons/mascots in each panel (e.g. cute dinosaurs, funny sun, talking tree).
- Keep classroom-friendly, simple, and easy to understand at a glance.
- Avoid clutter: large shapes, clear flow, minimal text.

Output:
- One single infographic illustration about ${topic}.
- Resolution: 1024x1024 or higher.`;
}