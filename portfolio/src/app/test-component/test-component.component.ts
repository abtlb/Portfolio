import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import graphDataJson from '../../assets/data.json';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

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
export class TestComponentComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chart', { static: true }) chartElement!: ElementRef;
  graphData = graphDataJson;
  private simulation?: d3.Simulation<NodeData, LinkData>;
  private resizeHandler?: () => void;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}


  ngAfterViewInit(): void {
    
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.createChart();
  }

  private createChart(): void {
    
    // Clear any existing chart
    if (this.chartElement?.nativeElement) {
      this.chartElement.nativeElement.innerHTML = '';
    }
    
    // Specify the dimensions of the chart.
    let width = window.innerWidth;
    let height = window.innerHeight;

    
    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    
    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links: LinkData[] = this.graphData.links.map(d => ({...d}));
    const nodes: NodeData[] = this.graphData.nodes.map(d => ({...d}));
    
    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => (d as NodeData).id).distance(d => 100 + Math.sqrt(d.value) * 10)) // Example: variable length
    // .force("charge", d3.forceManyBody().strength(d => (d as NodeData).group === 'Project' ? -200 : -50)) // Stronger repulsion for 'Project' nodes
    .force("charge", d3.forceManyBody().strength(-3000)) 
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force("collide", d3.forceCollide(d => (d.radius ?? 20) + 2)) // +2 for padding
    this.simulation = simulation;
    
    // Create the SVG container.
    const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto;");
    
         this.resizeHandler = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      svg.attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);
    };
    
    window.addEventListener('resize', this.resizeHandler);
    
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
      .attr("r", d => d.radius ?? 20) 
      .attr("fill", d => color(d.group));

  node.append("title")
      .text(d => d.id);

    const labels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", d => d.x!)
      .attr("y", d => d.y!)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .text(d => d.id)
      .style("pointer-events", "none"); // So it doesn't block drag

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
    labels
        .attr("x", (d: NodeData) => d.x!)
        .attr("y", (d: NodeData) => d.y!);
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
  const svgNode = svg.node();
  console.log(svgNode);
  console.log(this.chartElement?.nativeElement);
  this.chartElement.nativeElement.appendChild(svgNode);
  }

    ngOnDestroy(): void {
    // Clean up the simulation when component is destroyed
    if (this.simulation) {
      this.simulation.stop();
    }
    if (this.resizeHandler) {
    window.removeEventListener('resize', this.resizeHandler);
  }
  }
}