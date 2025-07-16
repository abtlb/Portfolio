import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import graphDataJson from '../../assets/data.json';

//{ id: string; group: string; radius?: undefined; citing_patents_count?: undefined; }

interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  group: string;
  radius?: number;
  citing_patents_count?: number;
}

interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  source: string | NodeData;
  target: string | NodeData;
  value: number;
}

@Component({
  selector: 'app-test-component',
  imports: [],
  templateUrl: './test-component.component.html',
  styleUrl: './test-component.component.scss'
})
export class TestComponentComponent implements AfterViewInit {
  @ViewChild('chart', { static: true }) chartElement!: ElementRef;
  graphData = graphDataJson;
  private simulation?: d3.Simulation<NodeData, LinkData>;

  ngAfterViewInit(): void {
  // Specify the dimensions of the chart.
  const width = 928;
  const height = 680;

  // Specify the color scale.
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // The force simulation mutates links and nodes, so create a copy
  // so that re-evaluating this cell produces the same result.
  const links: LinkData[] = this.graphData.links.map(d => ({...d}));
  const nodes: NodeData[] = this.graphData.nodes.map(d => ({...d}));

  // Create a simulation with several forces.
  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => (d as NodeData).id))
      .force("charge", d3.forceManyBody())
      .force("x", d3.forceX())
      .force("y", d3.forceY());

  this.simulation = simulation;

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto;");

  // Add a line for each link, and a circle for each node.
  const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

  const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("r", 5)
      .attr("fill", d => color(d.group));

  node.append("title")
      .text(d => d.id);

  // Add a drag behavior.
  node.call((d3.drag() as any)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  
  // Set the position attributes of links and nodes each time the simulation ticks.
  simulation.on("tick", () => {
    link
        .attr("x1",(d: LinkData) => (d.source as NodeData).x!)
        .attr("y1", (d: LinkData) => (d.source as NodeData).y!)
        .attr("x2", (d: LinkData) => (d.target as NodeData).x!)
        .attr("y2", (d: LinkData) => (d.target as NodeData).y!);

    node
        .attr("cx", (d: NodeData) => d.x!)
        .attr("cy", (d: NodeData) => d.y!);
  });

  // Reheat the simulation when drag starts, and fix the subject position.
  function dragstarted(event: d3.D3DragEvent<SVGCircleElement, unknown, NodeData>) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  // Update the subject (dragged node) position during drag.
  function dragged(event: d3.D3DragEvent<SVGCircleElement, unknown, NodeData>) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  // Restore the target alpha so the simulation cools after dragging ends.
  // Unfix the subject position now that it’s no longer being dragged.
  function dragended(event: d3.D3DragEvent<SVGCircleElement, unknown, NodeData>) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  // Return the SVG element.
  this.chartElement.nativeElement.appendChild(svg.node());
  }

    ngOnDestroy(): void {
    // Clean up the simulation when component is destroyed
    if (this.simulation) {
      this.simulation.stop();
    }
  }
}
