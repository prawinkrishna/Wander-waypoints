import * as L from 'leaflet';

declare module 'leaflet' {
  interface MarkerClusterGroupOptions {
    maxClusterRadius?: number | ((zoom: number) => number);
    iconCreateFunction?: (cluster: MarkerCluster) => Icon | DivIcon;
    clusterPane?: string;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    singleMarkerMode?: boolean;
    disableClusteringAtZoom?: number;
    removeOutsideVisibleBounds?: boolean;
    animate?: boolean;
    animateAddingMarkers?: boolean;
    spiderfyDistanceMultiplier?: number;
    spiderLegPolylineOptions?: PolylineOptions;
    chunkedLoading?: boolean;
    chunkInterval?: number;
    chunkDelay?: number;
    chunkProgress?: (processed: number, total: number, elapsed: number) => void;
    polygonOptions?: PolylineOptions;
  }

  interface MarkerCluster extends Marker {
    getChildCount(): number;
    getAllChildMarkers(): Marker[];
    zoomToBounds(options?: FitBoundsOptions): void;
    getBounds(): LatLngBounds;
  }

  class MarkerClusterGroup extends FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions);
    addLayer(layer: Layer): this;
    removeLayer(layer: Layer): this;
    addLayers(layers: Layer[]): this;
    removeLayers(layers: Layer[]): this;
    clearLayers(): this;
    getVisibleParent(marker: Marker): Marker;
    zoomToShowLayer(layer: Layer, callback?: () => void): void;
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}
