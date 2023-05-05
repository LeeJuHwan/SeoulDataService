const N = 300;

const gData = {
    nodes: [...Array(N).keys()].map(i => ({ id: i, adjacent_nodes: [] })),
    links: [...Array(N).keys()]
      .filter(id => id)
      .map(id => ({
        source: Math.round(Math.random() * (id - 1)),
        target: id
      }))
  };

gData.links.forEach(link => {
    gData.nodes[link.source].adjacent_nodes.push(link.target);
    gData.nodes[link.target].adjacent_nodes.push(link.source);
});

const graph_elem = document.querySelector(".graph")
const Graph = ForceGraph3D()(graph_elem)

var data_info_name = document.querySelector(".data_info > .content > span:nth-child(1) > .val")
var similar_data_content = document.querySelector(".similar_data > .content")

function update_data_info(node){
    data_info_name.innerText = node.index
}

function get_adjacent_data(node){
    similar_data_content.innerHTML = ""
    for(let node_idx of node.adjacent_nodes){
        let adj_span = document.createElement("span")
    
        let textnode = document.createTextNode(node_idx)
        adj_span.appendChild(textnode)

        adj_span.classList.add("adj_data")
        adj_span.addEventListener("click", (e) => {
            search_node(node_idx)
        })
        similar_data_content.appendChild(adj_span)

    }
}

function select_node(node){
    console.log(node)
    update_data_info(node)
    get_adjacent_data(node)

    const distance = 400;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    const newPos = node.x || node.y || node.z
        ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
        : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

    Graph.cameraPosition(
        newPos, // new position
        node, // lookAt ({ x, y, z })
        1500  // ms transition duration
    );
}

function search_node(idx){
    try{
        select_node(gData.nodes[idx])
    }
    catch{
        console.log(`failed to search ${idx}`)
    }

}

window.onload = function(){
    Graph.graphData(gData)
    Graph.onNodeClick(node => {
        select_node(node);
    })

    let search = document.querySelector(".search_button")
    search.addEventListener("click", (e) => {
        let search_target = document.querySelector(".search").value
        search_node(parseInt(search_target))
    })
}