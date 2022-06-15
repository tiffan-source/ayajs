import { _uuid } from "./uuid";
import { _Register } from "../register";
import {events} from "../events";
import { Point } from "./point";
import { config } from "../../config";
import { Form } from "../abstraction/form";


/**
 * @class Polyline
 */

class Polyline extends Form {
    /**
     * 
     * @param {string} uuid 
     */
    constructor(uuid, points = []){

        super();

        this.uuid = uuid;

        this.x = points[0];
        this.y = points[1];

        this.dest_x = points[points.length - 2];
        this.dest_y = points[points.length - 1];

        this.points = points;

        this.events = {};

        this.c_svg = "";
        this.type = "polyline";

        this.offsetX = 0;
        this.offsetY = 0;
    
        this.scaleX = 1;
        this.scaleY = 1;
    
        this.angle = 0;

        this.children = [];

        this.vertex = [
            new Point(this.uuid, 0, 0),
            new Point(this.uuid, 0, 0),
        ];
        this.c_points = [
            new Point(this.uuid, 0, 0),
            new Point(this.uuid, 0, 0),
        ];

        console.log(this);
    }

    addEvent(event, callback){
        this.c_svg.addEventListener(event, callback);
        this.events[event] = callback;
    }
    
    deleteEvent(event){
        var callback = this.events[event];
        this.c_svg.removeEventListener(event, callback);
        delete this.events[event];
    }

    addChild(child, translate, rotate){
        child.vertex = [];
        child.c_points = [];
        child.setOffsetX(this.x);
        child.setOffsetY(this.y);
        translate(this, child);
        rotate(this, child);
        child.draw(svg);
        this.children.push({child, translate, rotate});
    }
    
    drawVertex(){
        if(this.vertex.length == 0)
            return;
    }

    drawConnector(){
    }

    drawBox(){
    }

    draw(svg){
        const ns = "http://www.w3.org/2000/svg";
        this.c_svg = document.createElementNS(ns,'polyline');
        console.log(this.points);

        var path = "";
        for(var i = 0; i < this.points.length; i++){
                if(i % 2 == 0)
                    path += this.points[i] + ",";
                else
                    path += this.points[i] + " ";
        }
        this.c_svg.setAttribute("id", this.uuid);
        this.c_svg.setAttribute("fill", config.form.fill);
        this.c_svg.setAttribute("stroke", config.form.stroke);
        this.c_svg.setAttributeNS(null, "stroke-width", config.form.strokeWidth);
        this.c_svg.setAttribute("points", path);

        svg.appendChild(this.c_svg);

        this.drawVertex();

        this.c_points.map((point) => {
            point.draw(svg);
        });

        this.vertex.map( (vertex) => {
            vertex.draw(svg);
        });

        this.addEvent("mousedown", events.mouseDownCb);
    }

    removeFromDOM(){
        svg.removeChild(this.c_svg);
    }


    shift(dx,dy){
    }

    redraw(){
        this.drawVertex();
        this.vertex.map( (vertex) => {
            vertex.redraw();
        });

        var path = "" + this.points.map((pt, index) => {
            if(index % 2 == 0)
                pt + ",";
            else
                pt + " ";
        }) + " ";

        this.c_svg.setAttribute("point", path);

        this.children.map ( ({child, translate, rotate}) => {
            translate(this, child);
            rotate(this, child);
            child.redraw();
        });
    }

    calculateAngle(){
        var angle;
        this.pente = (this.dest_y - this.y) / (this.dest_x - this.x);

        if(this.pente == 0)
            angle = 0;
        if( this.pente >= 0 && (this.x < this.dest_x && this.y < this.dest_y))
            angle = Math.asin( (Math.sqrt( Math.pow((this.x - this.x), 2) + Math.pow((this.y - this.dest_y), 2)) ) / ( Math.sqrt( Math.pow((this.x - this.dest_x), 2) + Math.pow((this.y - this.dest_y), 2))) );
        else if(this.pente >= 0 && (this.x > this.dest_x && this.y > this.dest_y))
            angle = Math.PI + Math.asin( (Math.sqrt( Math.pow((this.x - this.x), 2) + Math.pow((this.dest_y - this.y), 2)) ) / ( Math.sqrt( Math.pow((this.x - this.dest_x), 2) + Math.pow((this.y - this.dest_y), 2))) );
        else if( this.pente <= 0 && (this.x < this.dest_x && this.y > this.dest_y))
            angle =  2 * Math.PI -  Math.asin( (Math.sqrt( Math.pow((this.x - this.x), 2) + Math.pow((this.dest_y - this.y), 2)) ) / ( Math.sqrt( Math.pow((this.x - this.dest_x), 2) + Math.pow((this.y - this.dest_y), 2))) );
        else if(this.pente <= 0 && (this.x > this.dest_x && this.y < this.dest_y))
            angle =   Math.PI -  Math.asin( (Math.sqrt( Math.pow((this.x - this.x), 2) + Math.pow((this.dest_y - this.y), 2)) ) / ( Math.sqrt( Math.pow((this.x - this.dest_x), 2) + Math.pow((this.y - this.dest_y), 2))) );

        return angle;
    }

    resize(pos, dx, dy){

        if(pos == 0){
            this.x += dx;
            this.y += dy;
        }
        else{
            this.dest_x += dx;
            this.dest_y += dy;
        }

        this.children.map ( ({child, translate, rotate}) => {
            translate(this, child);
            child.setRotateAngle((this.calculateAngle() + ( Math.PI * 90)/180));
            rotate(this, child);
            child.redraw();
        });
    }

    setRotateCenter(centerX, centerY){
        this.centerX = centerX;
        this.centerY = centerY;
    }
    
    setRotateAngle(angle){
        this.angle = angle;
    }

    setOffsetX(x){
        this.offsetX = x;
    }

    setOffsetY(y){
        this.offsetY = y;
    }

    setScaleX(x){
        this.scaleX = x;
    }

    setScaleY(y){
        this.scaleY = y;
    }

    getRotateAngle(){
       return  this.angle;
    }

    getOffsetX(){
        return this.offsetX;
    }

    getOffsetY(){
        return this.offsetY;
    }

    getScaleX(){
        return this.scaleX;
    }

    getScaleY(){
        return this.scaleY;
    }


    optimalPath(){

    }
}
export {Polyline};