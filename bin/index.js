#!/usr/bin/env node
"use strict";
let fs = require("fs");

const help = () => {
    // @todo implements
};

const generate_config = () => {
    // @todo implements
};

const render_html = data => {
    let assign = {
        "data" : data
    };

    {
        // 表示用の関数をオブジェクトに拡張しておく
        // @todo refactor
        let academic_histories = data.academic_histories || [];
        let work_histories = data.work_histories || [];
    
        let academic_flg = academic_histories.length == 0;
        let work_flg = work_histories.length == 0;
    
        assign.fetch_history = (index) => {
            if (! academic_flg) {
                academic_flg = true;
                return {
                    "year": "",
                    "month": "",
                    "value": "学歴"
                };
            }
    
            if (academic_histories.length > 0) {
                return academic_histories.shift();
            }
    
            if (! work_flg) {
                if (index == 12) { // １ページ目の最下段だったときはスキップ
                    return {
                        "year": "",
                        "month": "",
                        "value": ""
                    };
                }
                work_flg = true;
                return {
                    "year": "",
                    "month": "",
                    "value": "職歴"
                };
            }
    
            if (work_histories.length > 0) {
                return work_histories.shift();
            }
    
            return {
                "year": "",
                "month": "",
                "value": ""
            };

        };
    
        let licenses = data.licenses || [];
        assign.fetch_license = () => {
            if (licenses.length > 0) {
                return licenses.shift();
            }
    
            return {
                "year": "",
                "month": "",
                "value": ""
            };
        };

        assign.echo = (key, default_value) => {
            if (typeof data[key] == "undefined") {
                return default_value || "";
            }
            return data[key];
        };
    }

    const template_path = require('path').resolve(__dirname + '/../resource/template.ejs');
    let template = fs.readFileSync(template_path, 'utf8');
    return require("ejs").render(template, assign);
};

const make_pdf = (config_file, export_file) => {
    // @todo refactor & error handling
    let data = {};
    
    if (config_file && fs.existsSync(config_file)) {
        try {
            data = JSON.parse(fs.readFileSync(config_file, 'utf8'));
        } catch (error) {
            console.log(error.message)
            return;
        }
    }

    let html = render_html(data);

    let options = { format: "A4" };

    require("html-pdf").create(html, options).toFile(export_file, function(err, res) {
        if (err) {
            return console.log(err);
        }
        console.log(res); // { filename: '/app/businesscard.pdf' }
    });
};

{ // main処理
    let args = process.argv.slice(2);
    let config_file = args[0] || "resume.json";
    let export_file = args[1] || "resume.pdf";

    make_pdf(config_file, export_file);
}