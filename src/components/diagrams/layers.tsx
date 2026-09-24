import {
  IsoBox,
  IsoDots,
  IsoFaceText,
  IsoGuide,
  IsoLabel,
  IsoLift,
  IsoPlate,
  projector,
} from "./iso";

export function LayersCover() {
  const p = projector(13, 188, 158);
  const gap = 3.4;
  const corners: [number, number][] = [
    [-2.5, -3.2],
    [2.5, -3.2],
    [2.5, 3.2],
    [-2.5, 3.2],
  ];
  const tag = (z: number, index: string, text: string) => (
    <>
      <IsoLabel p={p} at={[2.5, -3.2, z]} dx={26} anchor="start" leader size={8} tone="accent">
        {index}
      </IsoLabel>
      <IsoLabel p={p} at={[2.5, -3.2, z]} dx={42} anchor="start" size={7} tone="default">
        {text}
      </IsoLabel>
    </>
  );
  return (
    <>
      <IsoLift lift={5}>
        <IsoBox p={p} at={[-2.5, -3.2, 0]} size={[5, 6.4, 0.22]} />
        <IsoDots p={p} at={[-2, -2.7, 0.22]} size={[4, 4]} step={0.36} shape="rows" lit={0.05} seed={5} />
        <IsoFaceText p={p} plane="top" at={[0, 2.2, 0.22]} size={7} tone="muted">
          Resume.pdf
        </IsoFaceText>
        {tag(0.11, "01", "Page text")}
      </IsoLift>

      {corners.map(([x, y]) => (
        <IsoGuide key={`${x}${y}`} p={p} from={[x, y, 0.22]} to={[x, y, gap * 2]} />
      ))}

      <IsoLift lift={-4} delay={60}>
        <IsoBox p={p} at={[-2.5, -3.2, gap]} size={[5, 6.4, 0.22]} tone="accent" />
        <IsoFaceText p={p} plane="top" at={[0, -0.8, gap + 0.22]} size={22} tone="accent">
          XMP
        </IsoFaceText>
        <IsoFaceText p={p} plane="top" at={[0, 1.4, gap + 0.22]} size={6} tone="muted">
          DC, IPTC, PRISM
        </IsoFaceText>
        {tag(gap + 0.11, "02", "XML metadata")}
      </IsoLift>

      <IsoLift lift={-13} delay={120}>
        <IsoPlate p={p} at={[-2.5, -3.2, gap * 2]} size={[5, 6.4]} />
        <IsoBox p={p} at={[-2, -2.6, gap * 2]} size={[2.6, 2, 0.9]} tone="accent" />
        <IsoFaceText p={p} plane="top" at={[-0.7, -1.6, gap * 2 + 0.9]} size={6} tone="accent">
          Schema
        </IsoFaceText>
        <IsoFaceText p={p} plane="left" at={[-0.7, -0.6, gap * 2 + 0.45]} size={6} tone="muted">
          .json
        </IsoFaceText>
        <IsoBox p={p} at={[-0.6, 0.6, gap * 2]} size={[2.6, 2, 0.9]} tone="accent" />
        <IsoFaceText p={p} plane="top" at={[0.7, 1.6, gap * 2 + 0.9]} size={6} tone="accent">
          Resume
        </IsoFaceText>
        <IsoFaceText p={p} plane="left" at={[0.7, 2.6, gap * 2 + 0.45]} size={6} tone="muted">
          .json
        </IsoFaceText>
        {tag(gap * 2, "03", "JSON files")}
      </IsoLift>
    </>
  );
}
