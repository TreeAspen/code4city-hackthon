import * as shp from 'shpjs';
import fs from 'node:fs';
import path from 'node:path';

const targets = [
  {
    base: 'src/asset/Borough Boundaries_20260426/geo_export_38bdc48b-1061-4a28-a1f2-a277533c90be',
    out: 'src/asset/boroughs.geo.json',
  },
  {
    base: 'src/asset/NYC_Community_Districts_-1557785881518429355/NYC_Community_Districts',
    out: 'src/asset/community-districts.geo.json',
  },
];

for (const t of targets) {
  const shpBuf = fs.readFileSync(t.base + '.shp');
  const dbfBuf = fs.readFileSync(t.base + '.dbf');
  const prjPath = t.base + '.prj';
  const prj = fs.existsSync(prjPath) ? fs.readFileSync(prjPath, 'utf8') : null;

  const geojson = shp.combine([
    shp.parseShp(shpBuf, prj),
    shp.parseDbf(dbfBuf),
  ]);
  fs.writeFileSync(t.out, JSON.stringify(geojson));
  console.log('wrote', t.out, 'features:', geojson.features.length);
}
