// <div class = "graph"> 에 3D graph 생성
const graph_elem = document.querySelector(".graph");

let Graph;
let graph_data;
let current_node;
let similar_nodes = [];
let selected_nodes = [];
let expand_source_nodes = [];
let expand_target_nodes = [];
let expand_links = [];
let category = 0;

// 모달 생성 버튼
const modal_overlay = document.querySelector(".modal_overlay");
const graph_make_modal = document.querySelector(".graph_make_modal");
const topic_make_modal = document.querySelector(".topic_make_modal");
const detail_info_modal = document.querySelector(".detail_info_modal");

// 그래프 설정

const selected_category = document.querySelector(".topic_select");
const similar_num = document.querySelector(".similar_select");

// 데이터 정보
const data_info_lists = document.querySelectorAll(
    ".data_info .content_list > li > .val"
);

// 데이터 상세 정보
const detail_info_lists = document.querySelectorAll(
    ".modal_overlay .detail_info_modal .modal_content .detail_list > li > .val"
);
// 상세 정보 링크
const page_link = document.querySelector(
    ".modal_overlay .detail_info_modal .modal_content .url_link"
);

let subject_list = [];

// 유사 데이터
const similar_data_content = document.querySelector(
    ".similar_data .similar_list"
);

// 관심 데이터
const interest_data_content = document.querySelector(
    ".selected_data .selected_list"
);

const search_input = document.querySelector(".search");
const autocomplete_list = document.querySelector(".autocomplete_list");
let nowIndex = 0;
let aclist_range = [0, 5];
let matched_nodes = [];

function getSearch() {
    const search_text = search_input.value;
    if (search_text == "") {
        matched_names = [];
        aclist_range = [0, 5];
        nowIndex = 0;
        autocomplete_list.innerHTML = "";
        return;
    }

    const temp_length = graph_data.nodes
        .map((node) => node.name)
        .filter((name) => name.includes(search_text)).length;

    console.log(temp_length, matched_nodes.length);
    if (temp_length != matched_nodes.length) {
        matched_nodes = graph_data.nodes.filter((node) =>
            node.name.includes(search_text)
        );
        aclist_range = [0, 5];
        nowIndex = 0;

        showList();
    }
}

function searchAutocomplete(e) {
    switch (e.keyCode) {
        case 38:
            nowIndex = Math.max(nowIndex - 1, 0);
            if (nowIndex < aclist_range[0]) {
                aclist_range = aclist_range.map((i) => i - 1);
            }
            break;
        case 40:
            nowIndex = Math.min(nowIndex + 1, matched_nodes.length - 1);
            if (nowIndex >= aclist_range[1]) {
                aclist_range = aclist_range.map((i) => i + 1);
            }
            break;
        case 13:
            search_input.value = matched_nodes[nowIndex].name;
            selectNode(matched_nodes[nowIndex]);
            aclist_range = [0, 4];
            nowIndex = 0;
            // matched_names.length = 0;
            break;
        default:
            nowIndex = 0;
            break;
    }

    showList();
}

function showList() {
    // showList
    autocomplete_list.innerHTML = "";
    matched_nodes.slice(...aclist_range).forEach((node, index) => {
        let li = document.createElement("li");
        if (nowIndex === index + aclist_range[0]) li.classList.add("active");

        li.addEventListener("click", (e) => {
            search_input.value = node.name;
            selectNode(node);
            aclist_range = [0, 4];
            nowIndex = 0;
            getSearch();
        });

        let label = document.createElement("label");
        label.classList.add("scrolled_text");
        label.innerText = node.name;
        li.appendChild(label);

        autocomplete_list.appendChild(li);
    });
}

function getNodeFromName(text) {
    let filtered = graph_data.nodes.filter((node) => node.name == text);
    if (filtered.length == 1) return filtered[0];
    else console.log("노드를 찾지 못했습니다.");
}

function selectNode(node) {
    Checked(node);

    const distance = 400;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    const newPos =
        node.x || node.y || node.z
            ? {
                  x: node.x * distRatio,
                  y: node.y * distRatio,
                  z: node.z * distRatio,
              }
            : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

    Graph.cameraPosition(
        newPos, // new position
        node, // lookAt ({ x, y, z })
        1000 // ms transition duration
    );
}

// 노드 확장
function expandNode(source_node, target_nodes) {
    // console.log();
    if (expand_source_nodes.includes(source_node)) {
        let idx = expand_source_nodes.findIndex((elem) => (elem = source_node));
        expand_source_nodes.splice(idx, 1);
        expand_target_nodes.splice(idx, 1);
        expand_links.splice(idx, 1);
    } else {
        expand_source_nodes.push(source_node);

        let target_list = [];
        let links_list = [];
        for (let tg of target_nodes) {
            target_list.push(tg);
            links_list.push({
                source: source_node,
                target: tg,
            });
        }
        expand_target_nodes.push(target_list);
        expand_links.push(links_list);
    }
    reloadData();
}

function Checked(node) {
    console.log("노드으으으으으", node)
    let nodeData = node.id;
    const csrftoken = Cookies.get("csrftoken");

    fetch("/web/", {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: nodeData, category: category }),
    })
        .then((response) => response.json())
        .then((data) => {
            return data;
        })
        .then((jsonData) => {
            let detail = jsonData["detail_data"][0];

            similar_nodes = [];
            let similar_data = new Array();
            for (let i = 0; i < 5; i++) {
                similar_data.push(jsonData["similar_data"][i][0]);
                let get_node = getNodeFromName(
                    `${similar_data[i]["서비스명"]}`
                );
                if (get_node) similar_nodes.push(get_node);
            }

            if (current_node === node) {
                expandNode(current_node, similar_nodes);
            } else {
                current_node = node;
            }

            reloadGraph();

            let data_info_strs = [
                `${detail["서비스ID"]}`,
                `${detail["서비스명"]}`,
                `${detail["대분류"]} / ${detail["중분류"]} / ${detail["소분류"]}`,
                `${detail["제공형식"]}`,
                `${detail["서비스설명"]}`,
            ];
            for (let idx in data_info_lists) {
                data_info_lists[idx].innerText = data_info_strs[idx];
            }

            let detail_info_strs = [
                `${detail["서비스ID"]}`,
                `${detail["서비스명"]}`,
                `${detail["대분류"]}`,
                `${detail["중분류"]}`,
                `${detail["소분류"]}`,
                `${detail["제공형식"]}`,
                `${detail["서비스설명"]}`,
                `${detail["시스템명"]}`,
                `${detail["제공기관"]}`,
                `${detail["제공부서명"]}`,
                `${detail["담당자명"]}`,
                `${detail["담당자연락처"]}`,
                `${detail["갱신주기"]}`,
                `${detail["최종갱신일자"]}`,
            ];

            for (let idx in detail_info_lists) {
                detail_info_lists[idx].innerText = detail_info_strs[idx];
            }
            page_link.setAttribute("href", detail["urls"]);

            similar_data_content.innerHTML = "";
            for (let i = 0; i < 5; i++) {
                let sim_li = document.createElement("li");

                sim_li.setAttribute("id", similar_data[i]["서비스ID"]);
                sim_li.addEventListener("click", (e) => {
                    let node = getNodeFromName(
                        `${similar_data[i]["서비스명"]}`
                    );
                    selectNode(node);
                });

                let scrolled_text = document.createElement("label");
                scrolled_text.classList.add("scrolled_text");
                scrolled_text.innerText = similar_data[i]["서비스명"];
                sim_li.appendChild(scrolled_text);

                similar_data_content.appendChild(sim_li);
            }

            if (selected_nodes.includes(node))
                document.querySelector(".data-select-button").innerText =
                    "관심 해제";
            else
                document.querySelector(".data-select-button").innerText =
                    "관심";
        })
        .catch((error) => console.error(error));
}

function basket() {
    let cart_data_id = document.querySelector(
        ".data_info .content_list > li:nth-child(1) > .val"
    ).innerHTML;
    let cart_data_name = document.querySelector(
        ".data_info .content_list > li:nth-child(2) > .val"
    ).innerHTML;
    if (cart_data_id) {

        let basket_node = current_node;
        if (selected_nodes.includes(basket_node)) {
            let idx = selected_nodes.findIndex((node) => node === basket_node);
            console.log(idx);
            selected_nodes.splice(idx, 1);
            subject_list.splice(idx, 1);
            interest_data_content.removeChild(
                interest_data_content.childNodes[idx]
            );
            document.querySelector(".data-select-button").innerText = "관심";
            return;
        }
        subject_list.push(cart_data_id);
        selected_nodes.push(basket_node);
        document.querySelector(".data-select-button").innerText = "관심 해제";
        reloadGraph();

        let bas_li = document.createElement("li");
        bas_li.setAttribute("id", cart_data_id);

        bas_li.addEventListener("click", (e) => {
            selectNode(basket_node);
        });

        let scrolled_text = document.createElement("label");
        scrolled_text.classList.add("scrolled_text");
        scrolled_text.innerText = cart_data_name;
        bas_li.appendChild(scrolled_text);

        interest_data_content.appendChild(bas_li);
        document.querySelector(".data-select-button").innerText = "관심 해제";

    } else {
        console.log("정보가 없습니다.");
    }
}

function subject(e) {
    field = document.querySelector(".side_window.selected_data > .window > .content > .field_input")
    purpose = document.querySelector(".side_window.selected_data > .window > .content > .purpose_input")
    addList = [field.value, purpose.value]
    
    const csrftoken = Cookies.get("csrftoken");
    fetch("/web/", {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartData: subject_list, addition: addList }),
    })
        .then((response) => response.json())
        .then((data) => {
            return data;
        })
        .then((jsonData) => {
            console.log('subjectResult', jsonData["subjectResult"])
        })
        .catch((error) => console.error(error));

        selected_ul = document.querySelector(".side_window.selected_data > .window > .content > .selected_list")
        selected_li = selected_ul.querySelectorAll('li')

        selected_li.forEach(li => {
            li.remove()
          });

        field.value = null;
        purpose.value = null;
        
        subject_list = [];
}

// 드래그 앤 드랍 코드
function dragElement(elmnt, target_elemnt) {
    let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        target_elemnt.style.top = target_elemnt.offsetTop - 10 - pos2 + "px";
        target_elemnt.style.left = target_elemnt.offsetLeft - 10 - pos1 + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function once() {
    if (is_action === true) {
        is_action = false;
        return false;
    } else {
        is_action = true;
        return true;
    }
}
//link 생성
function similarLink(node_source, node_target) {
    var person1 = new Object();
    person1.source = node_source.id;
    person1.target = node_target.id;
    return person1;
}

//randomnum
function getRandomNum() {
    let min = -40;
    let max = +40;
    return parseFloat((Math.random() * (max - min) + min).toFixed(3));
}

var is_action = false;
//유사 데이터 불러오기
function similardata(nh) {
    console.log("similar입니다", 1);
    let x = nh.fx;
    let y = nh.fy;
    let z = nh.fz;
    data_links = [];
    //유사도 패치 불러오기 return이 data 모양
    //data가 겹쳐서,, 그런다... 패치로 불러와야한다..
    if (is_action == false) {
        data_node = [
            { id: "일반행정", group: 5, collapsed: true, category: false },
            { id: "보건", group: 0, collapsed: true, category: false },
            { id: "문화/관광", group: 1, collapsed: true, category: false },
            { id: "산업/경제", group: 2, collapsed: true, category: false },
        ];
        is_action = once();
    } else {
        data_node = [
            { id: "안녕", group: 5, collapsed: true, category: false },
            { id: "호호", group: 0, collapsed: true, category: false },
            { id: "하/관광", group: 1, collapsed: true, category: false },
            { id: "경제", group: 2, collapsed: true, category: false },
        ];
        is_action = once();
    }

    data_node.forEach((i) => {
        i["fx"] = x + getRandomNum();
        i["fy"] = y + getRandomNum();
        i["fz"] = z + getRandomNum();
    });
    data_node.forEach((i) => {
        data_links.push(similarLink(nh, i));
    });
    return { nodes: data_node, links: data_links };
}

function createGraph() {
    graph_elem.innerHTML = "";
    Graph = ForceGraph3D()(graph_elem);
    // Graph.graphData(graph_data);
    Graph.nodeVal((node) => {
        return 5;
    });
    Graph.onNodeClick((node) => {
        selectNode(node);
    });
    // static background image
    Graph.nodeOpacity(0.68);
    Graph.linkDirectionalParticleWidth(2);
    // Graph.linkDirectionalParticleColor("red");
    Graph.backgroundColor("rgba(0, 0, 0, 0.0)");
    reloadGraph();
    reloadData();
}

function reloadGraph() {
    let expanded_link_list = expand_links.flat(1);
    let expanded_source_node_list = expand_source_nodes.flat(1);
    let expanded_target_node_list = expand_target_nodes.flat(1);
    Graph.nodeColor((node) => {
        if (current_node === node) return "yellow";
        else if (similar_nodes.includes(node)) return "#A68A56";
        else if (selected_nodes.includes(node)) return "#40180F";
        else if (expanded_source_node_list.includes(node)) return "red";
        else if (expanded_target_node_list.includes(node)) return "blue";
        else return "#732E1F";
    });
    Graph.linkWidth((link) => (expanded_link_list.includes(link) ? 6 : 2));
    Graph.linkColor((link) =>
        expanded_link_list.includes(link) ? "#FFFFFF" : "#B0B0B0"
    );
    Graph.linkDirectionalParticles((link) =>
        expanded_link_list.includes(link) ? 4 : 0
    );
}

function reloadData() {
    if (document.querySelector(".similar_link")) {
        let expanded_link_list = expand_links.flat(1);
        Graph.graphData({
            nodes: graph_data.nodes,
            links: graph_data.links.concat(expanded_link_list),
        });
    } else
        Graph.graphData({
            nodes: graph_data.nodes,
            links: graph_data.links,
        });
}

async function makeGraph() {
    const csrftoken = Cookies.get("csrftoken");

    category =
        selected_category.options[parseInt(selected_category.selectedIndex)]
            .value;
    console.log(category);
    const data = await fetch("/web/", {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: category }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            graph_data = data;
            Graph.graphData(graph_data);
            return data;
        });

    similar_nodes.length = 0;
    selected_nodes.length = 0;
    expand_source_nodes.length = 0;
    expand_target_nodes.length = 0;
    expand_links.length = 0;
}

(async function () {
    graph_data = await fetch("/web/node-coordinate/").then((response) =>
        response.json()
    );
    console.log(graph_data.nodes);
    is_action = false;
    // let jsonData = await load(); // load도 상수화,, json이 달라지니까
    //const nodesById = Object.fromEntries(jsonData.nodes.map(node => [node.name, node]))

    // const getNodesTree = (nh) => {
    //     const visibleNodes = [];
    //     const visibleLinks = [];
    //     console.log(jsonData, jsonData.nodes);
    //     jsonData.nodes.forEach((i) => visibleNodes.push(i));

    //     let arr = visibleNodes.filter((i) => {
    //         return i.collapsed == false;
    //     });
    //     console.log("arr", arr);

    //     if (!nh) {
    //         return { nodes: visibleNodes, links: visibleLinks };
    //     }

    //     if (!nh.collapsed) {
    //         console.log("collapsed");
    //         similar = similardata(nh);
    //         similar.nodes.forEach((i) => visibleNodes.push(i));
    //         similar.links.forEach((i) => visibleLinks.push(i));
    //     }

    //     if (arr) {
    //         arr.forEach((i) => {
    //             if (i != nh) {
    //                 similar = similardata(i);
    //                 similar.nodes.forEach((i) => visibleNodes.push(i));
    //                 similar.links.forEach((i) => visibleLinks.push(i));
    //             }
    //         });
    //     }

    //     console.log("visi", visibleNodes);
    //     return { nodes: visibleNodes, links: visibleLinks };
    // };

    //EventHandlers
    createGraph();

    window.addEventListener("resize", function () {
        Graph.width(graph_elem.offsetWidth);
        Graph.height(graph_elem.offsetHeight);
    });

    search_input.addEventListener("keyup", (e) => {
        getSearch();
    });

    search_input.addEventListener("keydown", (e) => {
        searchAutocomplete(e);
    });

    // 주제 데이터 버튼 클릭
    var subject_button = document.querySelector(".topic_modal_open");
    subject_button.addEventListener("click", (e) => {
        subject(e);
    });

    // 관심 데이터 버튼 클릭
    var data_cart = document.querySelector(".data-select-button");
    data_cart.addEventListener("click", (e) => {
        basket();
    });

    let search = document.querySelector(".search_button");
    search.addEventListener("click", (e) => {
        search_input.value = matched_nodes[nowIndex].name;
        selectNode(matched_nodes[nowIndex]);
        aclist_range = [0, 4];
        nowIndex = 0;
    });

    let side_windows = document.querySelectorAll(".side_window");
    for (let side_window of side_windows) {
        dragElement(side_window.querySelector(".title"), side_window);
        dragElement(side_window.querySelector("button"), side_window);
    }

    let side_window_buttons = document.querySelectorAll(
        ".side_window > button"
    );
    for (let but of side_window_buttons) {
        but.addEventListener("click", (e) => {
            but.parentNode.classList.toggle("open");
        });
    }

    let graph_modal_open = document.querySelector(".graph_modal_open");
    graph_modal_open.addEventListener("click", (e) => {
        makeGraph();
    });

    let detail_modal_open = document.querySelector(".detail-button");
    detail_modal_open.addEventListener("click", (e) => {
        console.log("상세정보 버튼 클릭");
        if (modal_overlay.classList.contains("hidden")) {
            modal_overlay.classList.remove("hidden");
        }
        if (detail_info_modal.classList.contains("hidden")) {
            detail_info_modal.classList.remove("hidden");
        }
    });

    let detail_modal_close = document.querySelector(".detail_modal_close");
    detail_modal_close.addEventListener("click", (e) => {
        if (!modal_overlay.classList.contains("hidden")) {
            modal_overlay.classList.add("hidden");
        }
        if (!detail_info_modal.classList.contains("hidden")) {
            detail_info_modal.classList.add("hidden");
        }
    });

    // let topic_modal_open = document.querySelector(".topic_modal_open");
    // topic_modal_open.addEventListener("click", (e) => {
    //     if (modal_overlay.classList.contains("hidden")) {
    //         modal_overlay.classList.remove("hidden");
    //     }
    //     if (topic_make_modal.classList.contains("hidden")) {
    //         topic_make_modal.classList.remove("hidden");
    //     }
    // });

    // let topic_modal_close = document.querySelector(".topic_modal_close");
    // topic_modal_close.addEventListener("click", (e) => {
    //     if (!modal_overlay.classList.contains("hidden")) {
    //         modal_overlay.classList.add("hidden");
    //     }
    //     if (!topic_make_modal.classList.contains("hidden")) {
    //         topic_make_modal.classList.add("hidden");
    //     }
    // });
})();
