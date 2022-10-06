/* initialize data as 'info' */
let info;

/* Asynchronous function to call graphic creators after data is loaded */
async function execute() {
  await d3.csv('wealth-health-2014.csv', d3.autoType).then(data => {
    console.log('dataset', data);
    info = data;
  })
  createLinearChart();
  createLogChart();
}

/* function to create a linear scatter plot of life expectancy vs. income */
function createLinearChart() {
  
  /* Sort info so smaller circles are graphed on top of bigger ones */
  info = info.sort((a, b) => (a.Population < b.Population) ? 1 : -1);
  
  /* define margins and container dimensions */
  const margin = ({top: 20, right: 20, bottom: 20, left: 20}); /* FIX THIS ??? */
  const width = 650 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  
  /* create chart container  and bind data */
  const linearChart = d3.select('.chart')
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transorm", "translate(" + margin.left + "," + margin.top + ")")
    .selectAll("div")
    .data(info)
    .enter();

  /* get min and max incomes */
  let extentIncome = d3.extent(info.map(d => d.Income));
  let minIncome = extentIncome[0];
  let maxIncome = extentIncome[1];
  
  /* get min and max life expectancies */
  let extentLife = d3.extent(info.map(d => d.LifeExpectancy));
  let minLife = extentLife[0];
  let maxLife = extentLife[1];
  
  /* define linear x scale */
  const xScale = d3.scaleLinear()
    .domain([minIncome - 10000, maxIncome])
    .range([0, width]);
  
  /* define linear y scale */
  const yScale = d3.scaleLinear()
    .domain([minLife - 2, maxLife + 2])
    .range([height, 0]);
  
  /* get unique region names */
  const uniques = new Set();
  const regionNames = info.filter(item => {
    if (uniques.has(item.Region)) {
      return false;
    }
    uniques.add(item.Region);
    return true;
  })
  
  /* color code the unique reigions */
  const ordinalScale = d3.scaleOrdinal()
    .domain(uniques)
    .range(d3.schemeTableau10)
  
  /* draw circles on chart */
  let circles = linearChart.append("circle")
    .attr("class", "circle")
    .attr("cx", d => xScale(d.Income))
    .attr("cy", d => yScale(d.LifeExpectancy))
    .attr("r", d => 4 + (d.Population / 100000000))
    .style("fill", function (d) {return ordinalScale(d.Region)})
    .style("stroke", "black")
    .style("opacity", 0.5);
  
  /* add x axis at bottom of chart */
  const xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(5, "s")
  
  /* add y axis at left of chart */
  const yAxis = d3.axisLeft()
    .scale(yScale)
  
  /* format x axis */
  linearChart.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);
  
  /* format y axis */
  linearChart.append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${width * 0.06}, 0)`)
    .call(yAxis);
  
  /* add x axis label */
  linearChart.append("text")
    .attr("class", "labels")
    .attr("x", width * 0.9)
    .attr("y", height * 0.98)
    .text("Income")
  
  /* add y axis label */
  linearChart.append("text")
    .attr("class", "labels y-label")
    .attr("x", width * 0.075)
    .attr("y", height * 0.01)
    .text("Life Expectancy")
  
  /* create and format tooltip for scatter plot */
  let tooltip = d3.select('.tooltip')
    .append("div")
    .style("position", "absolute")
    .style("padding", "5px")
    .style("background-color", "#f2f2f2")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "3px")
    .style("opacity", 0) 
  
  /* function for when mouse is hovering over circle */
  let mouseover = function (event, d) {
    const pos = d3.pointer(event, window)    
    tooltip.style("opacity", 0.9)
    
    d3.select(this)
      .style("fill", "#52f667") 
      .style("stroke", "red")
      .style("opacity", 1)
    
    tooltip.html("<strong> Country: </strong> " + d.Country + "<br> <strong> Region </strong> " + d.Region + 
                 "<br> <strong> Population: </strong> " + d3.format(",.2r")(d.Population) + "<br> <strong> Income: </strong> " 
                 + d3.format(",.2r")(d.Income) + "<br> <strong> Life Expectancy: </strong> " + d.LifeExpectancy)
      .style("left", pos[0] + "px")    
      .style("top", pos[1] + "px"); 
  } 

  /* function for when mouse leaves circle */
  let mouseleave = function() {
    tooltip.style("opacity", 0)
      .transition()
      .duration(200)

    d3.select(this)
        .style("stroke", "black")
        .style("fill", function (d) {return ordinalScale(d.Region)})
        .style("opacity", 0.5)
  } 

  /* event listener for hovering/no longer hovering */
  let tooltipEvent = circles
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave) 
  
  /* set dimensions for legend */
  const widthLegend = 100;
  const heightLegend = 100;  
  
    /* add legend containter to chart and format */
    let legend = linearChart.append("g")
        .attr("class", "legend")
        .attr("x", width - 200)
        .attr("y", height - 200)
        .attr("transform", `translate(${width-200},${height-200})`)
        .attr("height", 200)
        .attr("width", 200)

    /* add legend color boxes */
    legend.selectAll("rect")
        .data(uniques)
        .enter()
        .append("rect")
        .attr("position", "relative")
        .attr("x", 0)
        .attr("y", (_, i) => (20 + 2) * i)
        .attr("width", 10)
        .attr("height", 10)
        .style("margin", "5px")
        .style("fill", d => ordinalScale(d))
  
    /* add legend labels */
    legend.selectAll("label")
        .data(uniques)
        .enter()
        .append("text")
          .attr("class", "labels")  
          .attr("x", 25)
          .attr("y", (_, i) => 9 + (20 + 2) * i)
          .text(d => d)  
  
}

/* function to create scatter plot with log scale x axis */
function createLogChart() {
  
  /* Sort info so smaller circles are graphed on top of bigger ones */
  let info2 = info.sort((a, b) => (a.Population < b.Population) ? 1 : -1);
  
  /* set chart margins and dimensions */
  const margin = ({top: 20, right: 20, bottom: 20, left: 20}); /* FIX THIS ??? */
  const width = 650 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  
  /* create chart area and bind data */
  const logChart = d3.select('.logChart')
    .append('svg')
    .attr("class", "logChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transorm", "translate(" + margin.left + "," + margin.top + ")")
    .selectAll("div")
    .data(info2)
    .enter();

  /* get min and max income values */
  let extentIncome = d3.extent(info2.map(d => d.Income));
  let minIncome = extentIncome[0];
  let maxIncome = extentIncome[1];
  
  /* get min and max life expectancy values */
  let extentLife = d3.extent(info2.map(d => d.LifeExpectancy));
  let minLife = extentLife[0];
  let maxLife = extentLife[1];
  
  /* define x axis log scale */
  const xScale = d3.scaleLog()
    .domain([400, maxIncome])
    .range([0, width]);
  
  /* define y axis linear scales */
  const yScale = d3.scaleLinear()
    .domain([minLife, maxLife + 2])
    .range([height, 0]);
  
  /* get unique region names */
  const uniques = new Set();
  const regionNames = info2.filter(item => {
    if (uniques.has(item.Region)) {
      return false;
    }
    uniques.add(item.Region);
    return true;
  })
  
  /* color code region names */
  const ordinalScale = d3.scaleOrdinal()
    .domain(uniques)
    .range(d3.schemeTableau10)
  
  /* draw circles on log chart */
  let circles = logChart.append("circle")
    .attr("class", "circle")
    .attr("cx", d => xScale(d.Income))
    .attr("cy", d => yScale(d.LifeExpectancy))
    .attr("r", d => 4 + (d.Population / 100000000))
    .style("fill", function (d) {return ordinalScale(d.Region)})
    .style("stroke", "black")
    .style("opacity", 0.5);
  
  /* create x axis on bottom of chart */
  const xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(5, ".0s")
  
  /* create y axis on left of chart */
  const yAxis = d3.axisLeft()
    .scale(yScale)
  
  /* format x axis */
  logChart.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);
  
  /* format y axis */
  logChart.append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${width * 0.06}, 0)`)
    .call(yAxis);
  
  /* add x axis label */
  logChart.append("text")
    .attr("class", "labels")
    .attr("x", width * 0.9)
    .attr("y", height * 0.98)
    .text("Income")
  
  /* add y axis label */
  logChart.append("text")
    .attr("class", "labels y-label")
    .attr("x", width * 0.075)
    .attr("y", height * 0.01)
    .text("Life Expectancy")
  
  /* create and format tooltip for scatter plot */
  let tooltip = d3.select('.tooltip')
    .append("div")
    .style("position", "absolute")
    .style("padding", "5px")
    .style("background-color", "#f2f2f2")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "3px")
    .style("opacity", 0) 
  
  /* function for when mouse is hovering over circle */
  let mouseover = function (event, d) {
    const pos = d3.pointer(event, window)    
    tooltip.style("opacity", 0.9)
    console.log(pos);
    
    d3.select(this)
      .style("fill", "#52f667") 
      .style("stroke", "red")
      .style("opacity", 1)
    
    tooltip.html("<strong> Country: </strong> " + d.Country + "<br> <strong> Region </strong> " + d.Region + 
                 "<br> <strong> Population: </strong> " + d3.format(",.2r")(d.Population) + "<br> <strong> Income: </strong> " 
                 + d3.format(",.2r")(d.Income) + "<br> <strong> Life Expectancy: </strong> " + d.LifeExpectancy)
      .style("left", pos[0] + "px")    
      .style("top", pos[1] + "px"); 
  } 

  /* function for when mouse is no longer hovering over circle */
  let mouseleave = function() {
    tooltip.style("opacity", 0)
      .transition()
      .duration(200)

    d3.select(this)
        .style("stroke", "black")
        .style("fill", function (d) {return ordinalScale(d.Region)})
        .style("opacity", 0.5)
  } 

  /* event listener for hovering/no longer hovering */
  let tooltipEvent = circles
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave) 
  
  /* define legend dimensions */
  const widthLegend = 100;
  const heightLegend = 100;  
  
    /* create legend */
    let legend = logChart.append("g")
        .attr("class", "legend")
        .attr("x", width - 200)
        .attr("y", height - 200)
        // To move all children elements
        .attr("transform", `translate(${width-200},${height-200})`)
        .attr("height", 200)
        .attr("width", 200)

    /* add legend color boxes */
    legend.selectAll("rect")
        .data(uniques)
        .enter()
        .append("rect")
        .attr("position", "relative")
        .attr("x", 70)
        .attr("y", (_, i) => (20 + 2) * i)
        .attr("width", 10)
        .attr("height", 10)
        .style("margin", "5px")
        .style("fill", d => ordinalScale(d))
  
    /* add legend labels */
    legend.selectAll("label")
        .data(uniques)
        .enter()
        .append("text")
          .attr("class", "labels")  
          .attr("x", 95)
          .attr("y", (_, i) => 9 + (20 + 2) * i)
          .text(d => d)  
  
}

/* main funciton to run all functions above */
execute()