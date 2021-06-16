import { Component, OnInit } from '@angular/core';
import { Step } from './step';
import { StepService } from './step.service';
import * as $ from "jquery";
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, UrlHandlingStrategy } from '@angular/router';

@Component({
  selector: 'app-paths',
  templateUrl: './paths.component.html'
})

export class PathsComponent implements OnInit {
  ipAddress = '';
  editting=false;
  showjson=false;
  addingStep = false;
  deepUrl=window.location.origin;
  paths: any = [];
  typesArray: any[];
  tagsArray: any[];
  treesArray: any[];
  recommendersArray: any[];

  searchTerm: string
  selectedTagsSet: any = new Set();
  selectedTypesSet: any = new Set();
  selectedRecommendersSet: any = new Set();
  recommendersSet: any = [];
  urlparams : any;
  selectedStep: Step;
  selectedStepId: string;
  newMaterialUrl: string;
  booleanShiftPressed=false;

  constructor( private stepService: StepService, private http: HttpClient, private activatedRoute: ActivatedRoute) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.urlparams = params;
    }
  )}

  async ngOnInit() {
   this.getPaths();
   this.getUsersIP();
   let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
   await sleep(2000);
   this.toggleUrlParams(this.urlparams);
  }

  getUsersIP(){
    this.http.get("http://api.ipify.org/?format=json").subscribe((res:any)=>{
      this.ipAddress
      = res.ip;
    });
  }

  getPaths() {
    return this.stepService.getPaths().subscribe(paths => {
      var typeSet:any = new Set();
      var tagsSet:any = new Set();
      var treesSet:any = new Set();
      var recommendersSet:any = new Set();
      var pathsSet:any = new Set();

      for (let path in paths) {
        for (let step in paths[path]){
          if (step=="Tags"){
            var splitted = paths[path][step].split(" ")
            for (let w in splitted){
              if (splitted[w].trim().length>0)
                tagsSet.add(splitted[w] );
            }
          }
          if (step=="Type"){
            var splitted = paths[path][step].split(" ");
            for (let w in splitted){
              if (splitted[w].trim().length>0)
                typeSet.add(splitted[w] );
            }
          }
          if (step=="Tree"){
            var splitted = paths[path][step].split(" ");
            for (let w in splitted){
              let tree=splitted[w]
              if (tree.trim().length>0)
                treesSet.add(tree );
              while (tree.includes("/")){
                tree=tree.substring(0, tree.lastIndexOf('/'))
                treesSet.add(tree );
              }
            }
          }
          if (step=="Recommender"){
            var splitted = paths[path][step].split(" ");
            for (let w in splitted){
              if (splitted[w].trim().length>0)
                recommendersSet.add(splitted[w] );
            }
          }
        }
      }
      console.log("TAGS "+tagsSet.size );
      console.log("TYPES "+typeSet.size );
      this.paths = paths;
      this.typesArray = Array.from( typeSet );
      this.typesArray.sort()
      this.tagsArray  = Array.from( tagsSet );
      this.tagsArray.sort();
      this.treesArray  = Array.from( treesSet );
      this.treesArray.sort();
      this.recommendersArray  = Array.from( recommendersSet );
      this.recommendersArray.sort();

    });
  }

  toggleUrlStringParams(s:string){
    this.clearAll();
    let url = new URL(window.location.origin+s);
    let params = new URLSearchParams(url.search);
    console.log("URLSearchParams" + params.toString())
    params.getAll("f").forEach(
      function(value, key) {
         $( "button[name="+value+"]").trigger( "click" );
      });

    if (params.get("id")){
      this.onSelect(params.get("id"));
      $( "img[id='"+params.get("id")+"']").addClass("highlight");
    }
  }

  toggleUrlParams(url){
    // http://localhost:3000/?tags=a&tags=b&id=123123
    var args = url["f"];
    if (args){
      if (!Array.isArray(args))
        args = new Array(args);
      args.forEach(function( a, b ) {
        a = a.replace( /(:|\.|\/|\[|\]|,|=|@)/g, "\\$1" );
        $( "button[name="+a+"]").trigger( "click" );
      })
    }

    var ids = url["id"];
    if (!ids || Array.isArray(ids))
      return;
    this.onSelect(ids);
    $( "img[id='"+ids+"']").addClass("highlight");
  }

  gatherUrlParams(){
    var urlParams="?id="+this.selectedStepId;
    $( ".chosen").each(function( v1, v2 ) {
          urlParams+="&f="+v2.name;
      });
    this.deepUrl =  window.location.origin +urlParams
  }

  toggleMe(e){
    this.selectedStep=null;
    if (e!=null){
      var target = e.target || e.srcElement || e.currentTarget;
      target.classList = target.classList.contains("chosen") ? "": "chosen";
    }
    if ( $( ".chosen").length==0 && (!this.searchTerm ||  this.searchTerm.length==0)){
      $("img[alt='refreshPage']").removeClass("img-opaque");
      return;
    }

    $("img[alt='refreshPage']").addClass("img-opaque");
    $( ".chosen").each(function( v1,v2,s ) {
      $( "img[alt='refreshPage']").each(function( index ) {
        if ($( this).attr("name").includes( v2.name ))
          $( this).removeClass("img-opaque");
      });
    })
    if (this.searchTerm && this.searchTerm.length>0){
      let w = ""+this.searchTerm.toUpperCase()
      $( "img[alt='refreshPage']").each(function( index ) {
        if( $(this).attr("name").toUpperCase().includes( w )){
          $( this).removeClass("img-opaque");
        }
        }
      )}
      this.gatherUrlParams()
  }

  extractYouTubeDetails(youTubeURL, youTubeEndpoint) {
    let o = this.stepService.scrapeContent(youTubeEndpoint).subscribe(o => {
      const obj = JSON.parse(o+"");
      this.selectedStep.Title = obj.items[0].snippet.title;
      this.selectedStep.Description = obj.items[0].snippet.description;
      this.selectedStep.Thumb = obj.items[0].snippet.thumbnails.default.url;
      this.selectedStep.Url = youTubeURL;
      });
  }

  prepareNewStep() {
    this.editting=true;
    this.addingStep = true;
    this.selectedStep = new Step();
    var newUrl = this.newMaterialUrl
    this.selectedStep.Url = newUrl;
    this.selectedStep.ip=this.ipAddress
    this.selectedStep.Title = "To specify";
    this.selectedStep.Description = "To specify";
    this.selectedStep.Thumb = "";

    this.stepService.scrapeContent(newUrl).subscribe(o => {
      let s = o.toString();
      if (s.includes("<title>") ){
        this.selectedStep.Title = s.substring(  s.indexOf("<title>")+7, s.indexOf("</title>")).trim();
      }

      if (!newUrl.startsWith("https://www.youtube.com/"  ))
        return;

      var youTubeEndpoint = null;
      if (newUrl.includes("v=")) { // E.g. https://www.youtube.com/watch?v=1xo-0gCVhTU&t=1191s
        var id = newUrl.substring( newUrl.indexOf("v=")+2);
        if (id.includes("&"))
          id=id.substring(0, id.indexOf("&"));
        youTubeEndpoint = new URL("https://www.googleapis.com/youtube/v3/videos?part=snippet&id="+id);
        this.selectedStep.Type = "Video";
      }
      if (newUrl.includes("channel/")) { // Eg https://www.youtube.com/channel/UCwqC1-y3uk5Zfg6F5S_PcVw
        var id=newUrl.substring(newUrl.indexOf("channel/")+8);
        if (id.includes("/"))
          id=id.substring(0, id.indexOf("/"));
        youTubeEndpoint = new URL("https://www.googleapis.com/youtube/v3/channels?part=snippet&id="+id );
        this.selectedStep.Type = "YouTubeChannel";
      }
      if (newUrl.includes("user/")) { // Eg https://www.youtube.com/user/derekbanas/playlists
        var id=newUrl.substring(newUrl.indexOf("user/")+5);
        if (id.includes("/"))
          id=id.substring(0, id.indexOf("/"));
        youTubeEndpoint = new URL("https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername="+id );
        this.selectedStep.Type = "YouTubeChannel";
      }
      if (youTubeEndpoint)
        this.extractYouTubeDetails(newUrl, youTubeEndpoint);
    } );
  }

  onSelect(id: any) {

    if(this.booleanShiftPressed)
      return;

    $("img").removeClass("highlight");

    var candidates : any[];
    candidates = this.paths.filter(h => h.uid === id );
    if (!candidates || candidates.length==0)
      return;


    this.addingStep = false;
    this.selectedStep = candidates[0];
    this.selectedStepId=id
  }

  save() {
    if (!this.addingStep)
      this.stepService.deleteStep(this.selectedStep ).subscribe(res => {
        this.paths = this.paths.filter(h => h !== this.selectedStep );
      });

    this.stepService.addStep(this.selectedStep).subscribe( o => {
        this.addingStep = false;
        this.selectedStep = null;
        this.getPaths()
      });
  }

  deleteStep() {
    this.stepService.deleteStep(this.selectedStep ).subscribe(res => {
      this.paths = this.paths.filter(h => h !== this.selectedStep );
      if (this.selectedStep === this.selectedStep ) {
        this.selectedStep = null;
      }
    });
  }

  cancel() {
    this.addingStep = false;
    this.selectedStep = null;
  }

  onKeydown(event) {
    if (event.key === "Shift") {
      this.booleanShiftPressed=true;
    }
  }

  onKeyup(event) {
    if (event.key === "Shift") {
      this.booleanShiftPressed=false;
    }
  }

  copyToClipboard() {
    this.gatherUrlParams();
    const body = document.querySelector('body');
    const paragraph = document.querySelector('p');
    const area = document.createElement('textarea');
    body.appendChild(area);
    area.value = this.deepUrl;
    area.select();
    document.execCommand('copy');
    body.removeChild(area);
  }

  clearAll(){
    this.searchTerm=""
    $("button").removeClass("chosen");
    $("img[alt='refreshPage']").removeClass("img-opaque");
    this.gatherUrlParams();
  }
}
