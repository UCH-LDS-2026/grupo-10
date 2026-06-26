package com.itera.service;

import com.itera.model.Atraccion;
import com.itera.model.Viaje;
import com.itera.model.ViajeDestino;
import com.itera.model.ViajeVuelo;
import com.itera.model.ViajeAuto;
import com.itera.model.ItemItinerario;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Font;
import com.lowagie.text.Element;
import com.lowagie.text.Phrase;
import com.lowagie.text.Chunk;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.draw.LineSeparator;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final EntityManager entityManager;

    @Value("${frontend.dir:../frontend}")
    private String frontendDir;

    // Colores del Sistema de Diseño ITERA
    private static final Color COLOR_PRIMARY = new Color(0, 88, 191);       // #0058BF
    private static final Color COLOR_SURFACE = new Color(248, 249, 250);    // #F8F9FA
    private static final Color COLOR_TEXT_DARK = new Color(30, 41, 59);     // #1E293B
    private static final Color COLOR_TEXT_MUTED = new Color(100, 116, 139); // #64748B
    private static final Color COLOR_BORDER = new Color(226, 232, 240);     // #E2E8F0
    private static final Color COLOR_ACCENT = new Color(216, 226, 255);     // #D8E2FF

    // Fuentes estándar seguras
    private static final Font FONT_BRAND = new Font(Font.HELVETICA, 20, Font.BOLD, COLOR_PRIMARY);
    private static final Font FONT_TITLE = new Font(Font.HELVETICA, 16, Font.BOLD, COLOR_TEXT_DARK);
    private static final Font FONT_SECTION = new Font(Font.HELVETICA, 12, Font.BOLD, COLOR_PRIMARY);
    private static final Font FONT_DAY_HEADER = new Font(Font.HELVETICA, 11, Font.BOLD, COLOR_TEXT_DARK);
    private static final Font FONT_BOLD = new Font(Font.HELVETICA, 9, Font.BOLD, COLOR_TEXT_DARK);
    private static final Font FONT_NORMAL = new Font(Font.HELVETICA, 9, Font.NORMAL, COLOR_TEXT_DARK);
    private static final Font FONT_MUTED = new Font(Font.HELVETICA, 8, Font.NORMAL, COLOR_TEXT_MUTED);

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * Event Helper para numerar páginas y añadir pie de página
     */
    private static class FooterPageEvent extends PdfPageEventHelper {
        private final Font footerFont = new Font(Font.HELVETICA, 8, Font.NORMAL, COLOR_TEXT_MUTED);

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            String pageText = "Página " + writer.getPageNumber();
            cb.beginText();
            cb.setFontAndSize(footerFont.getCalculatedBaseFont(false), 8);
            cb.setColorFill(COLOR_TEXT_MUTED);
            // Numeración derecha
            cb.showTextAligned(PdfContentByte.ALIGN_RIGHT, pageText, document.right(), document.bottom() - 20, 0);
            // Branding izquierda
            cb.showTextAligned(PdfContentByte.ALIGN_LEFT, "Generado por ITERA - Tu planificador inteligente", document.left(), document.bottom() - 20, 0);
            cb.endText();
        }
    }

    /**
     * Genera el PDF completo del itinerario consultando la BD mediante SQL.
     * Si itinerario_items está vacío, usa los items del frontend como fallback.
     */
    public byte[] generarItinerarioPdf(String viajeId) {
        return generarItinerarioPdfConFallback(viajeId, null);
    }

    /**
     * Genera el PDF aceptando items del frontend (localStorage) como fallback
     * cuando no hay registros en itinerario_items (viajes creados manualmente).
     *
     * @param viajeId ID del viaje
     * @param frontendItems Lista de maps con keys: fecha, hora_inicio, hora_fin, nombre, descripcion, categoria, direccion
     */
    @SuppressWarnings("unchecked")
    public byte[] generarItinerarioPdfConFallback(String viajeId, List<Map<String, Object>> frontendItems) {
        // 1. Consultar Viaje (SQL Nativo)
        Viaje viaje;
        try {
            viaje = (Viaje) entityManager.createNativeQuery(
                    "SELECT * FROM viajes WHERE id = :id", Viaje.class)
                    .setParameter("id", viajeId)
                    .getSingleResult();
        } catch (NoResultException e) {
            throw new NoSuchElementException("Viaje no encontrado con ID: " + viajeId);
        }

        // 2. Consultar Destinos (SQL Nativo)
        List<ViajeDestino> destinos = entityManager.createNativeQuery(
                "SELECT * FROM viaje_destinos WHERE viaje_id = :viajeId ORDER BY orden ASC", ViajeDestino.class)
                .setParameter("viajeId", viajeId)
                .getResultList();

        // 3. Consultar Vuelos (SQL Nativo)
        List<ViajeVuelo> vuelos = entityManager.createNativeQuery(
                "SELECT * FROM viaje_vuelos WHERE viaje_id = :viajeId ORDER BY direction ASC, orden ASC", ViajeVuelo.class)
                .setParameter("viajeId", viajeId)
                .getResultList();

        // 4. Consultar Alquiler de Autos (SQL Nativo)
        List<ViajeAuto> autos = entityManager.createNativeQuery(
                "SELECT * FROM viaje_autos WHERE viaje_id = :viajeId ORDER BY orden ASC", ViajeAuto.class)
                .setParameter("viajeId", viajeId)
                .getResultList();

        // 5. Consultar Items de Itinerario (SQL Nativo)
        List<ItemItinerario> items = entityManager.createNativeQuery(
                "SELECT * FROM itinerario_items WHERE viaje_id = :viajeId", ItemItinerario.class)
                .setParameter("viajeId", viajeId)
                .getResultList();

        // 5b. Si no hay items en BD y se recibieron del frontend, usarlos como fallback
        boolean useFrontendFallback = (items == null || items.isEmpty()) &&
                (frontendItems != null && !frontendItems.isEmpty());

        // Crear documento PDF
        Document document = new Document(PageSize.A4, 36, 36, 54, 54);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new FooterPageEvent());
            document.open();

            // ----------------------------------------------------
            // A. Cabecera de Branding ITERA con Logo
            // ----------------------------------------------------
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{1, 1});

            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(PdfPCell.NO_BORDER);
            leftCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            // Tabla interna para alinear el logo y el texto de ITERA lado a lado
            PdfPTable brandTable = new PdfPTable(2);
            brandTable.setWidths(new float[]{1, 5});
            brandTable.getDefaultCell().setBorder(PdfPCell.NO_BORDER);
            brandTable.getDefaultCell().setVerticalAlignment(Element.ALIGN_MIDDLE);

            String logoPathStr = Paths.get(frontendDir != null ? frontendDir : "../frontend", "assets/logo/logo-fondoblanco.png").toAbsolutePath().toString();
            try {
                com.lowagie.text.Image logoImg = com.lowagie.text.Image.getInstance(logoPathStr);
                logoImg.scaleToFit(24, 24);
                PdfPCell imgCell = new PdfPCell(logoImg);
                imgCell.setBorder(PdfPCell.NO_BORDER);
                imgCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                brandTable.addCell(imgCell);
            } catch (Exception e) {
                // Agregar celda vacía si falla la carga del logo
                PdfPCell emptyCell = new PdfPCell(new Phrase(""));
                emptyCell.setBorder(PdfPCell.NO_BORDER);
                brandTable.addCell(emptyCell);
            }

            PdfPCell brandTextCell = new PdfPCell(new Phrase("ITERA", FONT_BRAND));
            brandTextCell.setBorder(PdfPCell.NO_BORDER);
            brandTextCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            brandTable.addCell(brandTextCell);

            leftCell.addElement(brandTable);
            headerTable.addCell(leftCell);

            PdfPCell titleCell = new PdfPCell(new Phrase("ITINERARIO OFICIAL", new Font(Font.HELVETICA, 10, Font.BOLD, COLOR_TEXT_MUTED)));
            titleCell.setBorder(PdfPCell.NO_BORDER);
            titleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            headerTable.addCell(titleCell);

            document.add(headerTable);

            // Línea separadora estética
            LineSeparator sep = new LineSeparator(1f, 100, COLOR_BORDER, Element.ALIGN_CENTER, -2);
            document.add(new Chunk(sep));
            document.add(new Paragraph("\n"));

            // ----------------------------------------------------
            // B. Datos Generales del Viaje (Ficha Técnica)
            // ----------------------------------------------------
            PdfPTable infoTable = new PdfPTable(1);
            infoTable.setWidthPercentage(100);

            PdfPCell infoCell = new PdfPCell();
            infoCell.setBackgroundColor(COLOR_SURFACE);
            infoCell.setBorderColor(COLOR_BORDER);
            infoCell.setPadding(12);

            Paragraph pViajeNombre = new Paragraph(viaje.getNombre(), FONT_TITLE);
            pViajeNombre.setSpacingAfter(4);
            infoCell.addElement(pViajeNombre);

            String principal = viaje.getDestinoPrincipal() != null ? viaje.getDestinoPrincipal() : "No especificado";
            Paragraph pDestino = new Paragraph("Destino Principal: " + principal, FONT_BOLD);
            pDestino.setSpacingAfter(2);
            infoCell.addElement(pDestino);

            String fechaInicioStr = viaje.getFechaInicio() != null ? viaje.getFechaInicio().format(DATE_FORMATTER) : "N/A";
            String fechaFinStr = viaje.getFechaFin() != null ? viaje.getFechaFin().format(DATE_FORMATTER) : "N/A";
            Paragraph pFechas = new Paragraph("Fechas del Viaje: " + fechaInicioStr + " al " + fechaFinStr, FONT_NORMAL);
            pFechas.setSpacingAfter(2);
            infoCell.addElement(pFechas);

            Paragraph pEstado = new Paragraph("Estado del Itinerario: " + (viaje.getEstado() != null ? viaje.getEstado() : "En Planificación"), FONT_MUTED);
            infoCell.addElement(pEstado);

            infoTable.addCell(infoCell);
            document.add(infoTable);
            document.add(new Paragraph("\n"));

            // ----------------------------------------------------
            // C. Ruta y Destinos
            // ----------------------------------------------------
            document.add(new Paragraph("Ruta y Destinos", FONT_SECTION));
            document.add(new Paragraph("\n"));

            if (destinos == null || destinos.isEmpty()) {
                Paragraph emptyDests = new Paragraph("No se han registrado destinos en la ruta.", FONT_NORMAL);
                document.add(emptyDests);
            } else {
                PdfPTable destsTable = new PdfPTable(4);
                destsTable.setWidthPercentage(100);
                destsTable.setWidths(new float[]{1, 4, 3, 2});

                // Headers
                destsTable.addCell(createHeaderCell("Orden"));
                destsTable.addCell(createHeaderCell("Ciudad / Destino"));
                destsTable.addCell(createHeaderCell("País"));
                destsTable.addCell(createHeaderCell("Noches"));

                int ord = 1;
                for (ViajeDestino d : destinos) {
                    destsTable.addCell(createNormalCell(String.valueOf(ord++)));
                    destsTable.addCell(createNormalCell(d.getCity()));
                    destsTable.addCell(createNormalCell(d.getCountry()));
                    destsTable.addCell(createNormalCell(String.valueOf(d.getNights())));
                }
                document.add(destsTable);
            }
            document.add(new Paragraph("\n"));

            // ----------------------------------------------------
            // D. Logística y Vuelos
            // ----------------------------------------------------
            document.add(new Paragraph("Vuelos y Logística de Transporte", FONT_SECTION));
            document.add(new Paragraph("\n"));

            if (vuelos == null || vuelos.isEmpty()) {
                Paragraph emptyFlights = new Paragraph("No hay vuelos ni tramos logísticos registrados para este viaje.", FONT_NORMAL);
                document.add(emptyFlights);
            } else {
                PdfPTable flightsTable = new PdfPTable(7);
                flightsTable.setWidthPercentage(100);
                flightsTable.setWidths(new float[]{2, 2, 2, 2, 2, 3, 3});

                flightsTable.addCell(createHeaderCell("Tramo"));
                flightsTable.addCell(createHeaderCell("Aerolínea"));
                flightsTable.addCell(createHeaderCell("Vuelo"));
                flightsTable.addCell(createHeaderCell("Origen"));
                flightsTable.addCell(createHeaderCell("Destino"));
                flightsTable.addCell(createHeaderCell("Salida"));
                flightsTable.addCell(createHeaderCell("Llegada"));

                for (ViajeVuelo v : vuelos) {
                    String tramo = v.getDirection().equalsIgnoreCase("ida") ? "Ida" : "Vuelta";
                    flightsTable.addCell(createNormalCell(tramo));
                    flightsTable.addCell(createNormalCell(v.getAirline()));
                    flightsTable.addCell(createNormalCell(v.getFlight()));
                    flightsTable.addCell(createNormalCell(v.getOrigin()));
                    flightsTable.addCell(createNormalCell(v.getDest()));
                    flightsTable.addCell(createNormalCell(formatDateTimeString(v.getDep())));
                    flightsTable.addCell(createNormalCell(formatDateTimeString(v.getArr())));
                }
                document.add(flightsTable);
            }
            document.add(new Paragraph("\n"));

            // ----------------------------------------------------
            // D2. Alquiler de Autos
            // ----------------------------------------------------
            document.add(new Paragraph("Alquiler de Autos", FONT_SECTION));
            document.add(new Paragraph("\n"));

            if (autos == null || autos.isEmpty()) {
                Paragraph emptyAutos = new Paragraph("No hay alquileres de autos registrados para este viaje.", FONT_NORMAL);
                document.add(emptyAutos);
            } else {
                PdfPTable autosTable = new PdfPTable(3);
                autosTable.setWidthPercentage(100);
                autosTable.setWidths(new float[]{3, 3, 4});

                autosTable.addCell(createHeaderCell("Compañía"));
                autosTable.addCell(createHeaderCell("Nº de Reserva"));
                autosTable.addCell(createHeaderCell("Lugar de Retiro"));

                for (ViajeAuto a : autos) {
                    autosTable.addCell(createNormalCell(a.getCompany()));
                    autosTable.addCell(createNormalCell(a.getBooking()));
                    autosTable.addCell(createNormalCell(a.getLocation()));
                }
                document.add(autosTable);
            }
            document.add(new Paragraph("\n"));

            // ----------------------------------------------------
            // E. Cronograma Diario (Timeline)
            // ----------------------------------------------------
            document.add(new Paragraph("Itinerario Diario Detallado", FONT_SECTION));
            document.add(new Paragraph("\n"));

            if (useFrontendFallback) {
                // ── Renderizar itinerario desde datos del frontend (localStorage) ──
                // Agrupar por fecha
                Map<String, List<Map<String, Object>>> groupedFE = new java.util.LinkedHashMap<>();
                for (Map<String, Object> fi : frontendItems) {
                    String fecha = fi.get("fecha") != null ? fi.get("fecha").toString() : "Sin fecha";
                    groupedFE.computeIfAbsent(fecha, k -> new ArrayList<>()).add(fi);
                }

                for (Map.Entry<String, List<Map<String, Object>>> entry : groupedFE.entrySet()) {
                    String fecha = entry.getKey();
                    List<Map<String, Object>> dayItems = entry.getValue();

                    // Ordenar por hora_inicio
                    dayItems.sort((a, b) -> {
                        String ha = a.get("hora_inicio") != null ? a.get("hora_inicio").toString() : "";
                        String hb = b.get("hora_inicio") != null ? b.get("hora_inicio").toString() : "";
                        return ha.compareTo(hb);
                    });

                    // Formatear fecha
                    String fechaLabel = fecha;
                    try {
                        LocalDate ld = LocalDate.parse(fecha);
                        fechaLabel = ld.format(DATE_FORMATTER);
                    } catch (Exception ignored) {}

                    document.add(new Paragraph(fechaLabel, FONT_DAY_HEADER));
                    document.add(new Paragraph("\n"));

                    PdfPTable itinTable = new PdfPTable(3);
                    itinTable.setWidthPercentage(100);
                    itinTable.setWidths(new float[]{2, 5, 5});
                    itinTable.addCell(createHeaderCell("Horario"));
                    itinTable.addCell(createHeaderCell("Actividad"));
                    itinTable.addCell(createHeaderCell("Descripción"));

                    for (Map<String, Object> fi : dayItems) {
                        String hi = fi.get("hora_inicio") != null ? fi.get("hora_inicio").toString() : "";
                        String hf = fi.get("hora_fin") != null ? fi.get("hora_fin").toString() : "";
                        String horaStr = (!hi.isEmpty() && !hf.isEmpty()) ? hi + " - " + hf
                                : (!hi.isEmpty() ? hi : "Sin hora");
                        itinTable.addCell(createNormalCell(horaStr));

                        String nombre = fi.get("nombre") != null ? fi.get("nombre").toString() : "Actividad";
                        String categoria = fi.get("categoria") != null ? fi.get("categoria").toString() : "";
                        PdfPCell nameCell = new PdfPCell();
                        nameCell.setBorderColor(COLOR_BORDER);
                        nameCell.setPadding(6);
                        nameCell.addElement(new Paragraph(nombre, FONT_BOLD));
                        if (!categoria.isEmpty()) nameCell.addElement(new Paragraph(categoria, FONT_MUTED));
                        itinTable.addCell(nameCell);

                        String desc = fi.get("descripcion") != null ? fi.get("descripcion").toString() : "-";
                        String dir = fi.get("direccion") != null ? fi.get("direccion").toString() : "";
                        PdfPCell descCell = new PdfPCell();
                        descCell.setBorderColor(COLOR_BORDER);
                        descCell.setPadding(6);
                        descCell.addElement(new Paragraph(desc.isEmpty() ? "-" : desc, FONT_NORMAL));
                        if (!dir.isEmpty()) descCell.addElement(new Paragraph(dir, FONT_MUTED));
                        itinTable.addCell(descCell);
                    }
                    document.add(itinTable);
                    document.add(new Paragraph("\n"));
                }

            } else if (items == null || items.isEmpty()) {
                Paragraph emptyItin = new Paragraph("El itinerario se encuentra vacío. No se han asignado actividades diarias.", FONT_NORMAL);
                document.add(emptyItin);
            } else {
                // Agrupar items por fecha
                Map<LocalDate, List<ItemItinerario>> grouped = new TreeMap<>();
                List<ItemItinerario> sinFecha = new ArrayList<>();

                for (ItemItinerario item : items) {
                    if (item.getFechaAsignada() == null) {
                        sinFecha.add(item);
                    } else {
                        grouped.computeIfAbsent(item.getFechaAsignada(), k -> new ArrayList<>()).add(item);
                    }
                }

                // Imprimir días programados
                for (Map.Entry<LocalDate, List<ItemItinerario>> entry : grouped.entrySet()) {
                    LocalDate fecha = entry.getKey();
                    List<ItemItinerario> dayItems = entry.getValue();

                    // Ordenar por hora de inicio
                    dayItems.sort((a, b) -> {
                        if (a.getHoraInicio() == null && b.getHoraInicio() == null) return 0;
                        if (a.getHoraInicio() == null) return -1;
                        if (b.getHoraInicio() == null) return 1;
                        return a.getHoraInicio().compareTo(b.getHoraInicio());
                    });

                    // Subcabecera de Día
                    document.add(new Paragraph(fecha.format(DATE_FORMATTER), FONT_DAY_HEADER));
                    document.add(new Paragraph("\n"));

                    PdfPTable itinTable = new PdfPTable(4);
                    itinTable.setWidthPercentage(100);
                    itinTable.setWidths(new float[]{2, 4, 3, 3});

                    itinTable.addCell(createHeaderCell("Horario"));
                    itinTable.addCell(createHeaderCell("Atracción"));
                    itinTable.addCell(createHeaderCell("Detalles"));
                    itinTable.addCell(createHeaderCell("Próxima Parada"));

                    for (ItemItinerario item : dayItems) {
                        // Consultar Atracción por SQL Nativo
                        Atraccion atr = null;
                        try {
                            atr = (Atraccion) entityManager.createNativeQuery(
                                    "SELECT * FROM atracciones WHERE id = :id", Atraccion.class)
                                    .setParameter("id", item.getAtraccionId())
                                    .getSingleResult();
                        } catch (NoResultException ignored) {}

                        // Columna Horario
                        String horaStr = "";
                        if (item.getHoraInicio() != null && item.getHoraFin() != null) {
                            horaStr = item.getHoraInicio().toString().substring(0, 5) + " - " + item.getHoraFin().toString().substring(0, 5);
                        } else if (item.getHoraInicio() != null) {
                            horaStr = item.getHoraInicio().toString().substring(0, 5);
                        } else {
                            horaStr = "Sin hora";
                        }
                        itinTable.addCell(createNormalCell(horaStr));

                        // Columna Atracción
                        String attrName = atr != null ? atr.getNombre() : "Atracción (" + item.getAtraccionId() + ")";
                        String address = (atr != null && atr.getDireccion() != null) ? atr.getDireccion() : "";
                        PdfPCell attrCell = new PdfPCell();
                        attrCell.setBorderColor(COLOR_BORDER);
                        attrCell.setPadding(6);
                        attrCell.addElement(new Paragraph(attrName, FONT_BOLD));
                        if (!address.isEmpty()) {
                            attrCell.addElement(new Paragraph(address, FONT_MUTED));
                        }
                        itinTable.addCell(attrCell);

                        // Columna Detalles (Categoría, Costo, Accesibilidad)
                        PdfPCell detailsCell = new PdfPCell();
                        detailsCell.setBorderColor(COLOR_BORDER);
                        detailsCell.setPadding(6);
                        if (atr != null) {
                            if (atr.getCategoria() != null && !atr.getCategoria().isEmpty()) {
                                detailsCell.addElement(new Paragraph("Cat: " + atr.getCategoria(), FONT_MUTED));
                            }
                            BigDecimal costo = atr.getCosto();
                            String costoStr = (costo == null || costo.compareTo(BigDecimal.ZERO) == 0) ? "Gratis" : "$" + costo;
                            detailsCell.addElement(new Paragraph("Costo: " + costoStr, FONT_MUTED));
                            if (atr.getNecesitaTurno() != null && atr.getNecesitaTurno()) {
                                detailsCell.addElement(new Paragraph("Requiere Turno", FONT_MUTED));
                            }
                        } else {
                            detailsCell.addElement(new Paragraph("-", FONT_MUTED));
                        }
                        itinTable.addCell(detailsCell);

                        // Columna Transporte / Siguiente
                        String transStr = "-";
                        if (item.getTransporteProxTipo() != null && !item.getTransporteProxTipo().isEmpty()) {
                            transStr = item.getTransporteProxTipo();
                            if (item.getTransporteProxDuracion() != null) {
                                transStr += " (~" + Math.round(item.getTransporteProxDuracion()) + " min)";
                            }
                        }
                        itinTable.addCell(createNormalCell(transStr));
                    }
                    document.add(itinTable);
                    document.add(new Paragraph("\n"));
                }

                // Imprimir atracciones sin programar
                if (!sinFecha.isEmpty()) {
                    document.add(new Paragraph("Atracciones Guardadas (Sin Fecha)", FONT_DAY_HEADER));
                    document.add(new Paragraph("\n"));

                    PdfPTable sinFechaTable = new PdfPTable(3);
                    sinFechaTable.setWidthPercentage(100);
                    sinFechaTable.setWidths(new float[]{5, 3, 4});

                    sinFechaTable.addCell(createHeaderCell("Atracción"));
                    sinFechaTable.addCell(createHeaderCell("Categoría"));
                    sinFechaTable.addCell(createHeaderCell("Dirección"));

                    for (ItemItinerario item : sinFecha) {
                        Atraccion atr = null;
                        try {
                            atr = (Atraccion) entityManager.createNativeQuery(
                                    "SELECT * FROM atracciones WHERE id = :id", Atraccion.class)
                                    .setParameter("id", item.getAtraccionId())
                                    .getSingleResult();
                        } catch (NoResultException ignored) {}

                        String attrName = atr != null ? atr.getNombre() : "Atracción";
                        sinFechaTable.addCell(createNormalCell(attrName));
                        sinFechaTable.addCell(createNormalCell(atr != null ? atr.getCategoria() : "-"));
                        sinFechaTable.addCell(createNormalCell(atr != null ? atr.getDireccion() : "-"));
                    }
                    document.add(sinFechaTable);
                    document.add(new Paragraph("\n"));
                }
            }

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error al generar el PDF: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    // Métodos auxiliares para formatear tablas
    private PdfPCell createHeaderCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE)));
        cell.setBackgroundColor(COLOR_PRIMARY);
        cell.setBorderColor(COLOR_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6);
        return cell;
    }

    private PdfPCell createNormalCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", FONT_NORMAL));
        cell.setBorderColor(COLOR_BORDER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6);
        return cell;
    }

    private String formatDateTimeString(String dtStr) {
        if (dtStr == null || dtStr.isBlank()) return "-";
        try {
            return dtStr.replace("T", " ");
        } catch (Exception e) {
            return dtStr;
        }
    }
}
