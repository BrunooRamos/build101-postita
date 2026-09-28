import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { APPLY_OPEN, OG_IMAGE_ALT } from "./event";

// Social card (WhatsApp / X / LinkedIn / Slack). Se genera en build.
// Póster de marca: monocromo, todo en minúsculas.
export const alt = OG_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#000000";
const WHITE = "#ffffff";
const BLUE = "#2563eb"; /* electric blue — acento de marca */

async function font(file: string) {
  return readFile(join(process.cwd(), "assets/fonts", file));
}

export default async function Image() {
  const [monoRegular, monoMedium, monoSemiBold] = await Promise.all([
    font("GeistMono-Regular.ttf"),
    font("GeistMono-Medium.ttf"),
    font("GeistMono-SemiBold.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: "64px 72px",
          fontFamily: "Geist Mono",
        }}
      >
        {/* label */}
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 400,
            color: BLUE,
          }}
        >
          la hackathon de ia más grande de uruguay
        </div>

        {/* headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 76,
            fontWeight: 600,
            color: WHITE,
            letterSpacing: -3,
            lineHeight: 1.1,
          }}
        >
          <span>construí lo que viene.</span>
          <span>en un fin de semana.</span>
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 600,
              color: WHITE,
              letterSpacing: -1.6,
            }}
          >
            build 101
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 500 }}>
            {APPLY_OPEN ? (
              <>
                <span style={{ color: WHITE }}>17 y 18 oct · inscribite&nbsp;</span>
                <span style={{ color: BLUE }}>→</span>
              </>
            ) : (
              <>
                <span style={{ color: BLUE }}>//&nbsp;</span>
                <span style={{ color: WHITE }}>inscripciones pronto</span>
              </>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist Mono", data: monoRegular, style: "normal", weight: 400 },
        { name: "Geist Mono", data: monoMedium, style: "normal", weight: 500 },
        { name: "Geist Mono", data: monoSemiBold, style: "normal", weight: 600 },
      ],
    },
  );
}
