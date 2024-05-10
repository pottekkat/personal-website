(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["exports", "echarts"], factory);
  } else if (
    typeof exports === "object" &&
    typeof exports.nodeName !== "string"
  ) {
    // CommonJS
    factory(exports, require("echarts"));
  } else {
    // Browser globals
    factory({}, root.echarts);
  }
})(this, function (exports, echarts) {
  var log = function (msg) {
    if (typeof console !== "undefined") {
      console && console.error && console.error(msg);
    }
  };
  if (!echarts) {
    log("ECharts is not Loaded");
    return;
  }
  echarts.registerTheme("pottekkat", {
    grid: {
      left: "5%",
      top: 50,
      right: "5%",
      bottom: 40,
      containLabel: true
    },
    color: [
      "#dd6b66",
      "#759aa0",
      "#e69d87",
      "#8dc1a9",
      "#ea7e53",
      "#eedd78",
      "#73a373",
      "#73b9bc",
      "#7289ab",
      "#91ca8c",
      "#f49f42",
    ],
    backgroundColor: "rgba(17,17,17,1)",
    textStyle: {
      fontFamily: "DejaVu Sans",
    },
    title: {
      textStyle: {
        color: "#f1f1f1",
      },
      subtextStyle: {
        color: "#aaaaaa",
      },
    },
    line: {
      itemStyle: {
        borderWidth: 1,
      },
      lineStyle: {
        width: 2,
      },
      symbolSize: 4,
      symbol: "circle",
      smooth: false,
    },
    radar: {
      itemStyle: {
        borderWidth: 1,
      },
      lineStyle: {
        width: 2,
      },
      symbolSize: 4,
      symbol: "circle",
      smooth: false,
    },
    bar: {
      itemStyle: {
        barBorderWidth: 0,
        barBorderColor: "#ccc",
      },
    },
    pie: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    scatter: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    boxplot: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    parallel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    sankey: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    funnel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    gauge: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    candlestick: {
      itemStyle: {
        color: "#fd1050",
        color0: "#0cf49b",
        borderColor: "#fd1050",
        borderColor0: "#0cf49b",
        borderWidth: 1,
      },
    },
    graph: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
      lineStyle: {
        width: 1,
        color: "#aaaaaa",
      },
      symbolSize: 4,
      symbol: "circle",
      smooth: false,
      color: [
        "#dd6b66",
        "#759aa0",
        "#e69d87",
        "#8dc1a9",
        "#ea7e53",
        "#eedd78",
        "#73a373",
        "#73b9bc",
        "#7289ab",
        "#91ca8c",
        "#f49f42",
      ],
      label: {
        color: "#f1f1f1",
      },
    },
    map: {
      itemStyle: {
        areaColor: "#eee",
        borderColor: "#444",
        borderWidth: 0.5,
      },
      label: {
        color: "#000",
      },
      emphasis: {
        itemStyle: {
          areaColor: "rgba(255,215,0,0.8)",
          borderColor: "#444",
          borderWidth: 1,
        },
        label: {
          color: "rgb(100,0,0)",
        },
      },
    },
    geo: {
      itemStyle: {
        areaColor: "#eee",
        borderColor: "#444",
        borderWidth: 0.5,
      },
      label: {
        color: "#000",
      },
      emphasis: {
        itemStyle: {
          areaColor: "rgba(255,215,0,0.8)",
          borderColor: "#444",
          borderWidth: 1,
        },
        label: {
          color: "rgb(100,0,0)",
        },
      },
    },
    categoryAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: "#f1f1f1",
        },
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: "#f1f1f1",
        },
      },
      axisLabel: {
        show: true,
        color: "#f1f1f1",
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: ["#aaaaaa"],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: ["#f1f1f1"],
        },
      },
    },
    valueAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: "#f1f1f1",
        },
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: "#f1f1f1",
        },
      },
      axisLabel: {
        show: true,
        color: "#f1f1f1",
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: ["#aaaaaa"],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: ["#f1f1f1"],
        },
      },
    },
    logAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: "#f1f1f1",
        },
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: "#f1f1f1",
        },
      },
      axisLabel: {
        show: true,
        color: "#f1f1f1",
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: ["#aaaaaa"],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: ["#f1f1f1"],
        },
      },
    },
    timeAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: "#f1f1f1",
        },
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: "#f1f1f1",
        },
      },
      axisLabel: {
        show: true,
        color: "#f1f1f1",
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: ["#aaaaaa"],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: ["#f1f1f1"],
        },
      },
    },
    toolbox: {
      iconStyle: {
        borderColor: "#999999",
      },
      emphasis: {
        iconStyle: {
          borderColor: "#666666",
        },
      },
    },
    legend: {
      textStyle: {
        color: "#f1f1f1",
      },
    },
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: "#f1f1f1",
          width: "1",
        },
        crossStyle: {
          color: "#f1f1f1",
          width: "1",
        },
      },
    },
    timeline: {
      lineStyle: {
        color: "#f1f1f1",
        width: 1,
      },
      itemStyle: {
        color: "#dd6b66",
        borderWidth: 1,
      },
      controlStyle: {
        color: "#f1f1f1",
        borderColor: "#f1f1f1",
        borderWidth: 0.5,
      },
      checkpointStyle: {
        color: "#e43c59",
        borderColor: "#c23531",
      },
      label: {
        color: "#f1f1f1",
      },
      emphasis: {
        itemStyle: {
          color: "#a9334c",
        },
        controlStyle: {
          color: "#f1f1f1",
          borderColor: "#f1f1f1",
          borderWidth: 0.5,
        },
        label: {
          color: "#f1f1f1",
        },
      },
    },
    visualMap: {
      color: ["#bf444c", "#d88273", "#f6efa6"],
    },
    dataZoom: {
      backgroundColor: "rgba(47,69,84,0)",
      dataBackgroundColor: "rgba(255,255,255,0.3)",
      fillerColor: "rgba(167,183,204,0.4)",
      handleColor: "#a7b7cc",
      handleSize: "100%",
      textStyle: {
        color: "#eeeeee",
      },
    },
    markPoint: {
      label: {
        color: "#f1f1f1",
      },
      emphasis: {
        label: {
          color: "#f1f1f1",
        },
      },
    },
  });
});
