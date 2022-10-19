
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { MapDirectionsRenderer, MapDirectionsService } from "@angular/google-maps";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { Rota, VALORES_PADRAO_DOM } from '../utils'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  //#region Campos
  zoom = 12;

  localizacaoOrigem: google.maps.LatLngLiteral;
  localizacaoDestino: google.maps.LatLngLiteral;

  distancia?: string = '0'
  duracao?: string = '0'
  @ViewChild('modalEntradaDeDados', { static: true })
  modalEntradaDeDados?: ElementRef;

  @ViewChild("INPUT_DESTINO", { static: true })
  inputDestino?: ElementRef;
  @ViewChild("INPUT_ORIGEM", { static: true })
  inputOrigem?: ElementRef;

  @ViewChild("conteudoSaidaDeDados")
  conteudoSaidaDeDados?: ElementRef;

  @ViewChild('conteudoInfo')
  conteudoInfoSaidaDeDados?: ElementRef;


  center: google.maps.LatLngLiteral = {
    lat: -12.257377,
    lng: -38.961352
  };

  optionsMap: google.maps.MapOptions = {
    mapTypeId: 'hybrid',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 18,
    minZoom: 8,

  };

  optionsAutoComplete: google.maps.places.AutocompleteOptions = {
    fields: ["formatted_address", "geometry", "name"],
    strictBounds: false,
  };

  directionsResults?: Observable<google.maps.DirectionsResult | undefined>;

  //#endregion
  //#region Funções do ambiente
  constructor(private readonly mapDirectionService: MapDirectionsService) {
    this.localizacaoDestino = { lat: 0, lng: 0 }
    this.localizacaoOrigem = { lat: 0, lng: 0 }
  }

  ngOnInit() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    });

    const origem: google.maps.places.Autocomplete = new google.maps.places.Autocomplete(this.inputOrigem!.nativeElement, this.optionsAutoComplete);
    const destino: google.maps.places.Autocomplete = new google.maps.places.Autocomplete(this.inputDestino!.nativeElement, this.optionsAutoComplete);

    this.AdicionarOuvinte(origem, Rota.Origem);
    this.AdicionarOuvinte(destino, Rota.Destino);
  }
  //#endregion
  //#region Funções próprias
  TracarRota() {
    const request: google.maps.DirectionsRequest = {
      origin: this.localizacaoOrigem,
      destination: this.localizacaoDestino,
      travelMode: google.maps.TravelMode.DRIVING,
      language: "pt-BR"
    };

    this.directionsResults = this.mapDirectionService.route(request).pipe(map(response => response.result));
    this.directionsResults.subscribe(res => {
      this.distancia = res?.routes[0].legs[0].distance?.text;
      this.duracao = res?.routes[0].legs[0].duration?.text
    })
    this.OcultarModalEntradaDeDados();
    this.ExibirConteudoDaSaidaDeDados();
  }

  AdicionarOuvinte(autoComplete: google.maps.places.Autocomplete, rota: Rota): void {
    autoComplete.addListener("place_changed", () => {
      const place = autoComplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      const lugar = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }

      if (rota == Rota.Destino)
        this.localizacaoDestino = lugar
      else if (rota == Rota.Origem)
        this.localizacaoOrigem = lugar
    });
  }

  UsarRotaAtualComoOrigem() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.localizacaoOrigem = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      (<HTMLInputElement>this.inputOrigem!.nativeElement).value = "Usando a posição atual como origem";
    });
  }

  CentralizarMapaNaPosicaoAtual() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    });
  }

  //#endregion
  //#region modal entrada de dados
  ManipularModalEntradaDeDados() {
    if (this.modalEntradaDeDados!.nativeElement.style.left == VALORES_PADRAO_DOM.ModalDeEntradaDados.ocultar)
      this.ExibirModalEntradaDeDados()
    else
      this.OcultarModalEntradaDeDados();
  }

  ExibirModalEntradaDeDados() { this.modalEntradaDeDados!.nativeElement.style.left = VALORES_PADRAO_DOM.ModalDeEntradaDados.exibir; }

  OcultarModalEntradaDeDados() { this.modalEntradaDeDados!.nativeElement.style.left = VALORES_PADRAO_DOM.ModalDeEntradaDados.ocultar; }
  //#endregion
  //#region modal de saida de Dados

  ManipularModalSaidaDeDados() {
    if (this.conteudoSaidaDeDados!.nativeElement.style.height == VALORES_PADRAO_DOM.ConteudoDaSaidaDeDados.ocultar)
      this.ExibirConteudoDaSaidaDeDados();
    else
      this.OcultarConteudoDaSaidaDeDados();
  }
  ExibirConteudoDaSaidaDeDados() {
    this.conteudoSaidaDeDados!.nativeElement.style.height = VALORES_PADRAO_DOM.ConteudoDaSaidaDeDados.exibir
    Array.from(document.getElementsByClassName('conteudoInfo')).forEach((item, index) => {
      (<HTMLSpanElement>item).style.opacity = '1'
    })
  }
  OcultarConteudoDaSaidaDeDados() {
    this.conteudoSaidaDeDados!.nativeElement.style.height = VALORES_PADRAO_DOM.ConteudoDaSaidaDeDados.ocultar
    Array.from(document.getElementsByClassName('conteudoInfo')).forEach((item, index) => {
      (<HTMLSpanElement>item).style.opacity = '0';
    })
  }


  //#endregion
}
