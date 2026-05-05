import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { artData } from '../data';
import { Loader2 } from 'lucide-react';

export default function MapSection() {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [activeState, setActiveState] = useState(null);
    const [loadingMap, setLoadingMap] = useState(true);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = 600;

        // Clear previous SVG contents
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("width", "100%")
            .attr("height", height)
            .style("background-color", "transparent");

        const g = svg.append("g");

        const projection = d3.geoMercator()
            .scale(width * 1.2)
            .center([82.8, 22.5])
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        const zoom = d3.zoom()
            .scaleExtent([0.8, 10])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
                g.selectAll("path").style("stroke-width", 1.5 / event.transform.k + "px");
            });

        svg.call(zoom);

        // Map controls
        d3.select("#zoom-in").on("click", () => svg.transition().duration(500).call(zoom.scaleBy, 1.5));
        d3.select("#zoom-out").on("click", () => svg.transition().duration(500).call(zoom.scaleBy, 0.75));
        d3.select("#zoom-reset").on("click", () => {
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
            setActiveState(null);
        });

        d3.json("https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson").then(function(topo) {
            setLoadingMap(false);

            g.selectAll("path")
                .data(topo.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "state-path")
                .style("fill", "#1F160B")
                .style("stroke", "#2C1E11") 
                .style("stroke-width", "1.5px")
                .style("cursor", "pointer")
                .style("shape-rendering", "optimizeSpeed")
                .style("transition", "all 0.3s")
                .on("mouseover", function(event, d) {
                    if (d.properties.NAME_1 !== activeState) {
                        d3.select(this).style("fill", "#362718");
                    }
                })
                .on("mouseout", function(event, d) {
                    if (d.properties.NAME_1 !== activeState) {
                        d3.select(this).style("fill", "#1F160B");
                    }
                })
                .on("click", function(event, d) {
                    const stateName = d.properties.NAME_1;
                    
                    g.selectAll("path")
                        .style("fill", "#1F160B")
                        .style("stroke", "#2C1E11");

                    d3.select(this)
                        .style("fill", "#F4D35E")
                        .style("stroke", "#FFFFFF");

                    setActiveState(stateName);

                    const bounds = path.bounds(d),
                          dx = bounds[1][0] - bounds[0][0],
                          dy = bounds[1][1] - bounds[0][1],
                          x = (bounds[0][0] + bounds[1][0]) / 2,
                          y = (bounds[0][1] + bounds[1][1]) / 2,
                          scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
                          translate = [width / 2 - scale * x, height / 2 - scale * y];

                    svg.transition()
                        .duration(750)
                        .call(
                            zoom.transform,
                            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
                        );
                });
        });

    }, [activeState]);

    const activeArts = activeState ? (artData[activeState] || []) : [];

    return (
        <section className="py-24 px-8 max-w-7xl mx-auto relative z-10" id="map-section">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-display text-gold mb-4 italic">Living Map of Heritage</h2>
                <p className="text-textSoft/80 font-sans max-w-2xl mx-auto">
                    Interact with the cartography below. Select a state to uncover its traditional artisans,
                    techniques, and ongoing preservation projects.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 bg-panel/30 border border-[#362718] p-4 relative min-h-[600px]">
                {loadingMap && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1F160B]/80 backdrop-blur-sm">
                        <Loader2 className="animate-spin text-gold w-10 h-10 mb-4" />
                        <div className="text-gold font-display tracking-[0.2em] uppercase text-sm animate-pulse">Loading Cartography...</div>
                    </div>
                )}

                {/* Map Container */}
                <div className="w-full lg:w-2/3 relative" ref={containerRef}>
                    {/* Controls */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                        <button id="zoom-in" className="w-8 h-8 bg-panel border border-[#362718] text-gold flex items-center justify-center hover:bg-[#362718] hover:border-gold transition-colors">+</button>
                        <button id="zoom-out" className="w-8 h-8 bg-panel border border-[#362718] text-gold flex items-center justify-center hover:bg-[#362718] hover:border-gold transition-colors">-</button>
                        <button id="zoom-reset" className="w-8 h-8 bg-panel border border-[#362718] text-gold flex items-center justify-center hover:bg-[#362718] hover:border-gold transition-colors">↺</button>
                    </div>
                    <svg ref={svgRef}></svg>
                </div>

                {/* Info Panel */}
                <div className="w-full lg:w-1/3 bg-panel border border-[#362718] p-8 flex flex-col max-h-[600px]">
                    <div className="border-b border-[#362718] pb-6 mb-6">
                        <h3 className="text-3xl font-display text-gold mb-2">{activeState || "Select a Region"}</h3>
                        <p className="text-textSoft/60 text-sm tracking-widest uppercase">
                            {activeState ? (activeArts.length > 0 ? `${activeArts.length} Art Form(s) Found` : "Documentation Pending") : "Waiting for interaction..."}
                        </p>
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-8">
                        {activeState ? (
                            activeArts.length > 0 ? (
                                activeArts.map((art, idx) => (
                                    <div key={idx} className="border-b border-[#362718] pb-8 last:border-0 last:pb-0">
                                        <div className="aspect-[4/3] bg-[#1F160B] mb-6 overflow-hidden border border-[#362718]">
                                            <img src={art.img} alt={art.name} className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-500" />
                                        </div>
                                        <h4 className="text-xl font-display text-gold mb-3">{art.name}</h4>
                                        <p className="text-textSoft/80 text-sm leading-relaxed mb-6">{art.desc}</p>
                                        <button className="w-full py-3 bg-transparent border border-gold text-gold text-xs font-bold tracking-[0.2em] uppercase hover:bg-gold hover:text-[#1F160B] transition-colors">
                                            View Artisans
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <div className="text-gold/50 mb-4">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    </div>
                                    <p className="text-textSoft/60 text-sm">We are currently cataloging artisans for this region. Check back soon.</p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-20 opacity-50">
                                <p className="text-textSoft/80 font-sans">The canvas awaits your selection.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
