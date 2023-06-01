import { CSS2DRenderer, CSS2DObject } from '//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js';

// 테마 프로토타입
function Theme(background_class, base_node_color, current_node_color, similar_node_color, selected_node_color, expand_source_node_color, expand_target_node_color){
    this.background_class = background_class;

    this.base_node_color = base_node_color;
    this.current_node_color = current_node_color;
    this.similar_node_color = similar_node_color;
    this.selected_node_color = selected_node_color
    this.expand_source_node_color = expand_source_node_color;
    this.expand_target_node_color = expand_target_node_color;
}

// 테마 설정
const theme_space = new Theme("theme_space",
                                "#765EFF",
                                "#24F018",
                                "#FFCC33",
                                "#40180F",
                                "#FF2828",
                                "#FF7B10")

const theme_sky = new Theme("theme_sky",
                            "#765EFF",
                            "#D4A7FB",
                            "#FFFFFF",
                            "#40180F",
                            "#2E64FE",
                            "#58ACFA")                               
                           
const theme_list = [theme_space, theme_sky]
let current_theme = theme_space;

// 그래프, 노드 변수
const graph_elem = document.querySelector(".graph");
let Graph;
let graph_data;
let similar_nodes = [];
let selected_nodes = [];
let expand_source_nodes = [];
let expand_target_nodes = [];
let subject_list = [];
let expand_links = [];
let category = 0;

// 현재 노드 데이터
let current_node;
let detail;

// 그래프 설정
const setting_category = document.querySelector(".topic_select");
const setting_preview = document.querySelector(".selected_show");
const setting_link = document.querySelector(".similar_link");
const setting_similar = document.querySelector(".similar_select");
const setting_theme = document.querySelector(".theme_select");

// 사이드 바
const side_data_info = document.querySelector(".side_window.data_info");
const side_graph_setting = document.querySelector(".side_window.setting");
const side_selected_data = document.querySelector(".side_window.selected_data");
const side_similar_data = document.querySelector(".side_window.similar_data");
const side_topic_window = document.querySelector(".topic_window");

// 모달
const modal_overlay = document.querySelector(".modal_overlay");
const help_modal = document.querySelector(".help_modal");
const slide_list = document.querySelector(".slide_list");

// 페이징
const slide_pages = document.querySelectorAll(".slide_list > *").length;
const slide_width = 688;
let page = 0;


// 데이터 정보 
let data_info_lists = document.querySelectorAll(
    ".data_info .content_list > li > .val"
);

// 상세 정보 링크
const page_link = document.querySelector(
    ".data_info .page-link"
);

// 유사 데이터
const similar_data_content = document.querySelector(
    ".similar_data .similar_list"
);

// 관심 데이터
const interest_data_content = document.querySelector(
    ".selected_data .selected_list"
);

// 주제
const topic_content = document.querySelector(".topic_window > .topic_list");

// 검색 
const search_input = document.querySelector(".search");
const autocomplete_list = document.querySelector(".autocomplete_list");
let nowIndex = 0;
let aclist_range = [0, 5];
let matched_nodes = [];

// 검색 텍스트 받기
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

// Autocomplete 키 작동
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

// Autocomplete 리스트 갱신
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

// 이름 -> 노드 정보 가져오기
function getNodeFromName(text) {
    let filtered = graph_data.nodes.filter((node) => node.name == text);
    if (filtered.length == 1) return filtered[0];
    else console.log("노드를 찾지 못했습니다.");
}

// 노드 선택
function selectNode(node) {
    focusCamera(node)
    
    let nodeData = node.id;
    const csrftoken = Cookies.get("csrftoken");
    const n =
    setting_similar.options[parseInt(setting_similar.selectedIndex)]
        .value;

    fetch("/web/", {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: nodeData, category: category, n: n }),
    })
        .then((response) => response.json())
        .then((data) => {
            return data;
        })
        .then((jsonData) => {
            // 디테일 정보 받아오기
            detail = jsonData["detail_data"][0];
            showData();

            // 유사 데이터 받아오기
            similar_nodes = [];
            let similar_data = new Array();
            for (let i = 0; i < n; i++) {
                similar_data.push(jsonData["similar_data"][i][0]);
                let get_node = getNodeFromName(
                    `${similar_data[i]["서비스명"]}`
                );
                if (get_node) similar_nodes.push(get_node);
            }
            showSimilar(similar_data, n)

            // 관심 버튼 갱신
            if (selected_nodes.includes(node))
                document.querySelector(".data-select-button").innerText =
                    "관심 해제";
            else
                document.querySelector(".data-select-button").innerText =
                    "관심";

            // 그래프 확장
            current_node = node;
            if (setting_link.checked) {
                expandNode(current_node, similar_nodes);
            }

            // 그래프 갱신
            reloadGraph();
        })
        .catch((error) => console.error(error));
}

// 카메라 포커싱
function focusCamera(node){
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
    
    if (expand_source_nodes.includes(source_node)) {
        let idx = expand_source_nodes.findIndex((elem) => (elem === source_node));
        console.log(idx)
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

// 상세 정보 보여주기
function showData(){
    if(side_data_info.classList.contains("expand")){
        
        const detail_strs = [
            `${detail["서비스ID"]}`,
            `${detail["서비스명"]}`,
            `${detail["대분류"]} / ${detail["중분류"]} / ${detail["소분류"]}`,
            `${detail["시스템명"]}`,
            `${detail["제공형식"]}`,
            `${detail["제공기관"]} - ${detail["제공부서명"]}`,
            `${detail["담당자명"]} ( ${detail["담당자연락처"]} )`,
            `${detail["최종갱신일자"]} (${detail["갱신주기"]})`,
            `${detail["서비스설명"]}`,
        ];
        for (let idx = 0; idx < detail_strs.length; idx++) {
            data_info_lists[idx].innerText = detail_strs[idx];
        }
    }
    else{
        const data_strs = [
            `${detail["서비스명"]}`,
            `${detail["대분류"]} / ${detail["중분류"]} / ${detail["소분류"]}`,
            `${detail["서비스설명"]}`,
        ];
        for (let idx = 0; idx < data_strs.length; idx++) {
            data_info_lists[idx].innerText = data_strs[idx];
        }
    }

    page_link.setAttribute("href", detail["urls"]);
}

// 유사 데이터 보여주기
function showSimilar(similar_data, n){
    similar_data_content.innerHTML = "";
    for (let i = 0; i < n; i++) {
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
}

// 관심 데이터 등록 / 해제
function basket() {
;
    if (detail) {
        let cart_data_name = `${detail["서비스명"]}`;
        let cart_data_id = detail["서비스ID"];

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

// 주제 생성
async function getSubject() {
    let field = document.querySelector(".side_window.selected_data > .window > .content > .field_input")
    let purpose = document.querySelector(".side_window.selected_data > .window > .content > .purpose_input")
    
    const csrftoken = Cookies.get("csrftoken");
    let data = await fetch("/web/", {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartData: subject_list, field: field.value, purpose: purpose.value }),
    })
        .then((response) => response.json())
        .then((json) => json["subjectResult"][0])
        .catch((error) => console.error(error));

        
    return data
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

function dataTable(){
    const detail_titles = [
        '서비스 ID',
        '서비스 이름',
        '서비스 분류',
        '시스템 명',
        '제공 형식',
        '제공 기관',
        '담당자',
        '갱신',
        '서비스 설명'
    ]

    let table = document.createElement("table")
    table.classList.add("content_table")

    for (let i = 0; i < detail_titles.length; i++){
        let tr = document.createElement("tr")

        let th = document.createElement("th")
        th.innerText = detail_titles[i];

        let td = document.createElement("td")
        
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);
    }

    return table
}

function dataList(){
    const data_titles = [
        '서비스 이름',
        '서비스 분류',
        '서비스 설명'
    ]

    let ul = document.createElement("ul")
    ul.classList.add("content_list")

    for (let i = 0; i < data_titles.length; i++){
        let li = document.createElement("li")

        let text = document.createTextNode(data_titles[i])

        let span = document.createElement("span")
        span.classList.add("val")
        span.classList.add("scrollbar")

        li.appendChild(text)
        li.appendChild(span)
        ul.appendChild(li)
    }

    return ul
}


// 그래프 초기 설정
function createGraph() {
    graph_elem.innerHTML = "";
    Graph = ForceGraph3D( {extraRenderers: [new CSS2DRenderer()]})(graph_elem);
    // Graph.graphData(graph_data);
    Graph.nodeVal((node) => {
        return 4;
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

// 그래프 외형 갱신
function reloadGraph() {
    let expanded_source_node_list = expand_source_nodes;
    let expanded_link_list = expand_links.flat(1);
    let expanded_target_node_list = expand_target_nodes.flat(1);
    Graph.nodeColor((node) => {
        if (current_node === node) return current_theme.current_node_color;//"#7553CB"; 핑크: #D4A7FB 노랑 : #FFCC33
        else if (similar_nodes.includes(node)) return current_theme.similar_node_color;//"#68A17E" -> 유사 노드
        else if (selected_nodes.includes(node)) return current_theme.selected_node_color;
        else if (expanded_source_node_list.includes(node)) return current_theme.expand_source_node_color;
        else if (expanded_target_node_list.includes(node)) return current_theme.expand_target_node_color;
        else return current_theme.base_node_color;//#6F74FF"; 보라: #463899
    });
    Graph.nodeVal(node => {
        if(current_node === node)
            return 36
        else if (similar_nodes.includes(node))
            return 16
        else
            return 4
    })
    Graph.linkWidth((link) => (expanded_link_list.includes(link) ? 3 : 1));
    Graph.linkColor((link) =>
        expanded_link_list.includes(link) ? "#FFFFFF" : "#B0B0B0"
    );
    Graph.linkDirectionalParticles((link) =>
        expanded_link_list.includes(link) ? 4 : 0
    );
    Graph.nodeThreeObjectExtend(true)
}

// 그래프 데이터 갱신
function reloadData() {
    if (setting_link.checked) {
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

// 그래프 생성
async function getGraph() {
    const csrftoken = Cookies.get("csrftoken");

    category =
        setting_category.options[parseInt(setting_category.selectedIndex)]
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

// 초기 동작
(async function () {
    graph_data = await fetch("/web/node-coordinate/").then((response) =>
        response.json()
    );
    console.log(graph_data.nodes);

    //EventHandlers
    createGraph();

    // 리사이징
    window.addEventListener("resize", function () {
        Graph.width(graph_elem.offsetWidth);
        Graph.height(graph_elem.offsetHeight);
    });

    // 검색 이벤트
    search_input.addEventListener("keyup", (e) => {
        getSearch();
    });
    search_input.addEventListener("keydown", (e) => {
        searchAutocomplete(e);
    });

    // 그래프 설정 이벤트
    // 테마 변경
    setting_theme.addEventListener("change", (e) => {
        graph_elem.classList.remove(current_theme.background_class)
        document.querySelector("body").classList.remove(current_theme.background_class)

        let theme_idx = parseInt(setting_theme.selectedIndex)
        current_theme = theme_list[theme_idx]
        
        graph_elem.classList.add(current_theme.background_class)
        document.querySelector("body").classList.add(current_theme.background_class)
        reloadGraph();
    })

    // 카테고리 선택시 갱신
    setting_category.addEventListener("change", (e) => {
        getGraph();
    })

    // 이름 미리보기 선택시 갱신
    setting_preview.addEventListener("change", (e) => {
        if(setting_preview.checked){
            Graph.nodeThreeObject(node => {
                if(similar_nodes.includes(node) || selected_nodes.includes(node) || current_node === node){
                    const nodeEl = document.createElement('div');
                    nodeEl.className = 'node-label';
                    nodeEl.textContent = node.name;
                    // if(node === current_node) nodeEl.style.color = "white";
                    return new CSS2DObject(nodeEl);
                }
              })
        }
        else{
            Graph.nodeThreeObject(() => {});
        }
    })

    //유사 데이터 개수
    setting_similar.addEventListener("change", (e) => {

        if(side_similar_data.classList.contains('middle')) side_similar_data.classList.remove('middle')
        else if(side_similar_data.classList.contains('big')) side_similar_data.classList.remove('big')
        else if(side_similar_data.classList.contains('small')) side_similar_data.classList.remove('small')

        switch(setting_similar.selectedIndex){
            case 0: side_similar_data.classList.add('small'); break;
            case 1: side_similar_data.classList.add('middle'); break;
            case 2: side_similar_data.classList.add('big'); break;
        }
    })


    // 관심 데이터 버튼 클릭
    var data_cart = document.querySelector(".data-select-button");
    data_cart.addEventListener("click", (e) => {
        basket();
    });

    // 검색 클릭
    let search = document.querySelector(".search_button");
    search.addEventListener("click", (e) => {
        search_input.value = matched_nodes[nowIndex].name;
        selectNode(matched_nodes[nowIndex]);
        aclist_range = [0, 4];
        nowIndex = 0;
    });

    // 사이드바 드래그 이벤트
    let side_windows = document.querySelectorAll(".side_window");
    for (let side_window of side_windows) {
        dragElement(side_window.querySelector(".title"), side_window);
        dragElement(side_window.querySelector("button"), side_window);
    }

    // 사이드바 클릭 이벤트
    let side_window_buttons = document.querySelectorAll(
        ".side_window > button"
    );
    for (let but of side_window_buttons) {
        but.addEventListener("click", (e) => {
            but.parentNode.classList.toggle("open");
        });
    }

    // 상세정보 토글
    let detail_modal_open = document.querySelector(".detail-button");
    detail_modal_open.addEventListener("click", (e) => {
        if(detail){
            let inner = side_data_info.querySelector(".window > .content > .inner_content");
            inner.innerHTML = "";

            if(side_data_info.classList.contains("expand")){
                side_data_info.classList.remove("expand");
                detail_modal_open.innerText = "상세히 보기";
                inner.appendChild(dataList());
                data_info_lists = inner.querySelectorAll(".val");
                showData();
            }
            else{
                side_data_info.classList.add("expand");
                detail_modal_open.innerText = "간략히 보기";
                inner.appendChild(dataTable());
                data_info_lists = inner.querySelectorAll("td");
                showData();
            }
        }
    });

    // 주제 생성 오픈
    let topic_window_open = document.querySelector(".topic_window_open");
    topic_window_open.addEventListener("click", async function(e) {
        topic_window_open.innerText = "주제 생성 중..."
        topic_window_open.disabled = true;
        let result = await getSubject().then(result => result);
        console.log(result)
        topic_content.innerHTML = "";
        for(let topic of result){

            let li = document.createElement("li");

            let label = document.createElement("label");
            label.classList.add("scrolled_text");
            label.innerText = topic
            li.appendChild(label)

            console.log(topic)
            topic_content.appendChild(li);
        }
        topic_window_open.innerText = "주제 생성"
        topic_window_open.disabled = false;

        if (!side_topic_window.classList.contains("open")) {
            side_topic_window.classList.add("open");
        }
    });

    let topic_window_close = document.querySelector(".topic_window_close");
    topic_window_close.addEventListener("click", (e) => {
        if (side_topic_window.classList.contains("open")) {
            side_topic_window.classList.remove("open");
            topic_window_open.innerText = "주제 생성"
        }
    });

    let help_modal_open = document.querySelector(".help_modal_open");
    help_modal_open.addEventListener("click", (e) => {
        if (modal_overlay.classList.contains("hidden")) {
            modal_overlay.classList.remove("hidden");
        }

        if (help_modal.classList.contains("hidden")) {
            help_modal.classList.remove("hidden");
        }
    })

    let help_modal_close = document.querySelector(".help_modal_close");
    help_modal_close.addEventListener("click", (e) => {
        if (!modal_overlay.classList.contains("hidden")) {
            modal_overlay.classList.add("hidden");
        }

        if (!help_modal.classList.contains("hidden")) {
            help_modal.classList.add("hidden");
        }
    })

    let slide_left = document.querySelector(".slide_left");
    slide_left.addEventListener("click", (e) => {
        if(page > 0){
            page--;
            slide_list.style.marginLeft = `-${slide_width*page}px`
        }
    })

    let slide_right = document.querySelector(".slide_right")
    slide_right.addEventListener("click", (e) => {
        if(page < slide_pages - 1){
            page++;
            slide_list.style.marginLeft = `-${slide_width*page}px`
        }
    })

})();
