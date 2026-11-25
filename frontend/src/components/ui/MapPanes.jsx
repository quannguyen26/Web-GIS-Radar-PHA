import { Pane } from "react-leaflet";
import { panes } from "../../lib/constants";

const MapPanes = () =>
  panes.map(({ name, zIndex }) => (
    <Pane key={name} name={name} style={{ zIndex }} />
  ));

export default MapPanes;
