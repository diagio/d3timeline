var TimeKnots = {
  draw: function(id, events, options, minValueOverride, maxValueOverride){
    var cfg = {
      width: 600,
      height: 200,
      radius: 10,
      lineWidth: 4,
      color: "#999",
      background: "#FFF",
      dateFormat: "%Y/%m/%d %H:%M:%S",
      horizontalLayout: true,
      showLabels: false,
      labelFormat: "%Y/%m/%d %H:%M:%S",
      addNow: false,
      seriesColor: d3.scale.category20(),
      axisOrientation: "bottom",
      nice: "month",
      translateX : 0,
      translateY : 0
    };
    
    
    //default configuration overrides
    if(options != undefined){
      for(var i in options){
        cfg[i] = options[i];
      }
    }
    if(cfg.addNow != false){
      events.push({date: new Date(), name: cfg.addNowLabel || "Today"});
    }
    
    //Calculate times in terms of timestamps
    
    var timestamps = events.map(function(d){return  Date.parse(d.date);});//new Date(d.date).getTime()});
    
    var redraw = false;
    
    var minValue = d3.min(timestamps);
    var origMinValue = minValue;
    if (minValueOverride != undefined) {
    	minValue = minValueOverride;
    	redraw = true;
    }
    var maxValue = d3.max(timestamps);
    var origMaxValue = maxValue;
    if (maxValueOverride != undefined) {
    	maxValue = maxValueOverride;
    	redraw = true;
    }
    
    if (redraw) {
    	var div = d3.select(id);
    	div.selectAll("*").remove();
    }
    
    var tip = d3.select(id)
    .append('div')
    .style("opacity", 0)
    .style("position", "absolute")
    .style("font-family", "Helvetica Neue")
    .style("font-weight", "300")
    .style("background","rgba(0,0,0,0.5)")
    .style("color", "white")
    .style("padding", "5px 10px 5px 10px")
    .style("-moz-border-radius", "8px 8px")
    .style("border-radius", "8px 8px");
    
    var svg = d3.select(id)
    	.append('svg')
    	.attr("width", cfg.width)
    	.attr("height", cfg.height)
    	.call(d3.behavior.zoom().on("zoom", function () {
      svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
    }))
    .append("g");

    var margin = (d3.max(events.map(function(d){return d.radius})) || cfg.radius)*1.5+cfg.lineWidth;
    var step = (cfg.horizontalLayout)?((cfg.width-2*margin)/(maxValue - minValue)):((cfg.height-2*margin)/(maxValue - minValue));
    var series = [];
    if(maxValue == minValue){step = 0;if(cfg.horizontalLayout){margin=cfg.width/2}else{margin=cfg.height/2}}
    svg.append("line")
    .attr("class", "timeline-line")
    .attr("x1", function(d){if(cfg.horizontalLayout){return (margin)} return Math.floor(cfg.width/2)})
    .attr("x2", function(d){if(cfg.horizontalLayout){return (cfg.width - margin)} return Math.floor(cfg.width/2)})
    .attr("y1", function(d){if(cfg.horizontalLayout){return Math.floor(cfg.height/2)}return margin})
    .attr("y2", function(d){if(cfg.horizontalLayout){return Math.floor(cfg.height/2)}return cfg.height-margin})
    .style("stroke", cfg.color)
    .style("stroke-width", cfg.lineWidth);
    
    svg.selectAll("circle")
    .data(events).enter()
    .append("circle")
    .attr("class", "timeline-event")
    .attr("r", function(d){if(d.radius != undefined){return d.radius} return cfg.radius})
    .style("stroke", function(d){
                    if(d.color != undefined){
                      return d.color
                    }
                    if(d.series != undefined){
                      if(series.indexOf(d.series) < 0){
                        series.push(d.series);
                      }
                      console.log(d.series, series, series.indexOf(d.series));
                      return cfg.seriesColor(series.indexOf(d.series));
                    }
                    return cfg.color}
    )
    .style("stroke-width", function(d){if(d.lineWidth != undefined){return d.lineWidth} return cfg.lineWidth})
    .style("fill", function(d){if(d.background != undefined){return d.background} return cfg.background})
    .attr("cy", function(d){
        if(cfg.horizontalLayout){
          return Math.floor(cfg.height/2)
        }
        return Math.floor(step*(new Date(d.date).getTime() - minValue) + margin)
    })
    .attr("cx", function(d){
        if(cfg.horizontalLayout){
          var x=  Math.floor(step*(new Date(d.date).getTime() - minValue) + margin);
          return x;
        }
        return Math.floor(cfg.width/2)
    }).on("mouseover", function(d){
      var format = d3.time.format(cfg.dateFormat);
      var datetime = format(new Date(d.date)); 
      var dateValue = (datetime != "")?(d.name +" <small>("+datetime+")</small>"):d.name;
      d3.select(this)
      	.style("stroke", function(d){
            if(d.selectedColor != undefined){
                return d.selectedColor;
              }
            if(cfg.selectedColor != undefined){
                return cfg.selectedColor;
              }
            if(d.color != undefined){
                return d.color;
              }
            return cfg.color;
        })
        .style("stroke-width", function(d){
        	if (d.selectedLineWidth != undefined) {
        		return d.selectedLineWidth;
        	}
        	if (cfg.selectedLineWidth != undefined) {
        		return cfg.selectedLineWidth;
        	}
        	if (d.lineWidth != undefined) {
        		return d.lineWidth;
        	}
        	return cfg.lineWidth;
        });
      
      /*
      .style("fill", function(d){if(d.color != undefined){return d.color} return cfg.color}).transition()
      .duration(100).attr("r",  function(d){if(d.radius != undefined){return Math.floor(d.radius*1.5)} return Math.floor(cfg.radius*1.5)});
      */
      
      tip.html("");
      if(d.img != undefined){
        tip.append("img").style("float", "left").style("margin-right", "4px").attr("src", d.img).attr("width", "64px");
      }
      tip.append("div").style("float", "left").html(dateValue ); 
      tip.transition()
      .duration(100)
      .style("opacity", .9);
    
    }).on("mouseout", function(){
        d3.select(this)
        .style("fill", function(d){if(d.background != undefined){return d.background} return cfg.background})
      	.style("stroke", function(d){
            if(d.color != undefined){
                return d.color;
              }
            return cfg.color;
        })
        .style("stroke-width", function(d){
        	if (d.lineWidth != undefined) {
        		return d.lineWidth;
        	}
        	return cfg.lineWidth;
        })
        .transition()
        .duration(100)
        .attr("r", function(d){if(d.radius != undefined){return d.radius} return cfg.radius});
        
        tip.transition()
        .duration(100).style("opacity", 0)
    }).on("click", function(d) {
    	if (d.click != undefined) {
    		eval("(" + d.click + ")()");
    	}
    });
    
    //Adding start and end labels
    if(cfg.showLabels != false){
      var format = d3.time.format(cfg.labelFormat);
      var startString = format(new Date(minValue));
//      var startStringLength = startString.getBBox().width+8;
      var endString = format(new Date(maxValue));
      
      
      svg.append("text")
         .text(startString).style("font-size", "70%")
         .attr("x", function(d){if(cfg.horizontalLayout){return d3.max([0, (margin-this.getBBox().width/2)])} return Math.floor(this.getBBox().width/2)})
         .attr("y", function(d){if(cfg.horizontalLayout){return Math.floor(cfg.height/2+(margin+this.getBBox().height))}return margin+this.getBBox().height/2});
         
      svg.append("text")
         .text(endString).style("font-size", "70%")
         .attr("x", function(d){if(cfg.horizontalLayout){return  cfg.width -  d3.max([this.getBBox().width, (margin+this.getBBox().width/2)])} return Math.floor(this.getBBox().width/2)})
         .attr("y", function(d){if(cfg.horizontalLayout){return Math.floor(cfg.height/2+(margin+this.getBBox().height))}return cfg.height-margin+this.getBBox().height/2})
    }
    
    if (cfg.dateSlider) {
        var slider = d3.select(id)
    	.append('div')
    	.attr("id", 'slider');
    	
        // Add date slider
        $( document ).ready(function() {
            $("#slider").dateRangeSlider();
            $("#slider").dateRangeSlider("bounds", new Date(origMinValue), new Date(origMaxValue));
            $("#slider").dateRangeSlider("min", new Date(minValue));
            $("#slider").dateRangeSlider("max", new Date(maxValue));
        });        

        $( document ).ready(function() {
            $("#slider").bind("userValuesChanged", function(e, data){
            	var dateValues = $("#slider").dateRangeSlider("values");
                TimeKnots.draw(id, events, options, Date.parse(dateValues.min), Date.parse(dateValues.max));
            });
        });
    }
    
    svg.on("mousemove", function(){
        tipPixels = parseInt(tip.style("height").replace("px", ""));
    return tip.style("top", (d3.event.pageY-tipPixels-margin)+"px").style("left",(d3.event.pageX+20)+"px");})
    .on("mouseout", function(){return tip.style("opacity", 0).style("top","0px").style("left","0px");});

    // Add axis
    var minDate = new Date(minValue);
    var maxDate = new Date(maxValue);

    var axisLength = (cfg.horizontalLayout) ? cfg.width : cfg.height;
    
    var x = d3.time.scale()
	    .domain([minDate, maxDate])
	    .nice(getNice(cfg.nice))
	    .range([0, axisLength - 25]);
    
    var xAxis = d3.svg.axis()
	.scale(x)
	.orient(cfg.axisOrientation)
	.ticks(5)
	.tickFormat(d3.time.format(cfg.labelFormat));
    
    svg.append("g")
    	.attr("transform", "translate(" + cfg.translateX + "," + cfg.translateY + ")")
    	.attr("class", "axis")
    	.call(xAxis);

  }

}

function getNice(val) {
	switch(val) {
	case 'year':
		return d3.time.year;
	case 'month':
		return d3.time.month;
	case 'day':
		return d3.time.day;
	case 'hour':
		return d3.time.hour;
	case 'minute':
		return d3.time.minute;
	}
}
