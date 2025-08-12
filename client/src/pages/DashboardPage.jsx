import { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DashboardPage = () => {
    const [username, setUsername] = useState('');
    const [directorio, setDirectorio] = useState('');
    const [anticipo, setAnticipo] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchReport = async (e) => {
        e.preventDefault();
        if (!username || !directorio) {
            setError('Por favor, ingrese un usuario y un directorio.');
            return;
        }
        
        setLoading(true);
        setError('');
        setReportData(null);

        try {
            const response = await axios.get(`/api/GeneradorReporte`, {
                params: {
                    username: username,
                    directorio: directorio
                }
            });
            setReportData(response.data);
        } catch (err) {
            console.error('Error fetching report:', err);
            const errorMessage = err.response?.data || 'Ocurrió un error al buscar el reporte.';
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        } finally {
            setLoading(false);
        }
    };

    const generatePdf = () => {
        if (!reportData) return;

        const doc = new jsPDF();
        const anticipoNum = Number(anticipo || 0);
        const montoTotal = reportData.monto_total_calculado;
        const diferencia = anticipoNum - montoTotal;

        // Title
        doc.text('Reporte de Liquidación', 14, 20);

        // Summary Info
        doc.setFontSize(12);
        doc.text(`Usuario: ${reportData.username}`, 14, 30);
        doc.text(`Directorio: ${reportData.directorio}`, 14, 36);
        doc.text(`Anticipo: Bs. ${anticipoNum.toFixed(2)}`, 14, 42);
        doc.text(`Monto Total facturas: Bs. ${montoTotal.toFixed(2)}`, 14, 48);

        if (diferencia > 0) {
            doc.text(`Diferencia a Pagar: Bs. ${diferencia.toFixed(2)}`, 14, 54);
        } else if (diferencia < 0) {
            doc.text(`Diferencia a Cobrar: Bs. ${(-diferencia).toFixed(2)}`, 14, 54);
        } else {
            doc.text(`Diferencia: Bs. 0.00`, 14, 54);
        }

        // Table
        const tableColumn = ["ID Factura", "Monto (Bs.)", "Fecha"];
        const tableRows = [];

        reportData.facturas.forEach(factura => {
            const facturaData = [
                factura.id,
                factura.montoTotal.toFixed(2),
                factura.fechaTransaccion
            ];
            tableRows.push(facturaData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 65,
        });

        // Save
        doc.save(`reporte-${reportData.directorio}.pdf`);
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Relacion Final de Facturas</h2>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Consultar Reporte de Liquidación</h5>
                    <form onSubmit={handleFetchReport}>
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Usuario</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="ej: elio villalobos"
                                    required
                                />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Directorio</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={directorio}
                                    onChange={(e) => setDirectorio(e.target.value)}
                                    placeholder="ej: liquidacion-abril25"
                                    required
                                />
                            </div>
                            <div className="col-md-2 mb-3">
                                <label className="form-label">Anticipo (Bs.)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={anticipo}
                                    onChange={(e) => setAnticipo(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="col-md-2 d-flex align-items-end mb-3">
                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? 'Buscando...' : 'Consultar'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {reportData && (
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5>Resultados del Reporte</h5>
                        <button className="btn btn-secondary btn-sm" onClick={generatePdf}>
                            Descargar PDF
                        </button>
                    </div>
                    <div className="card-body">
                        <p><strong>Usuario:</strong> {reportData.username}</p>
                        <p><strong>Directorio:</strong> {reportData.directorio}</p>
                        <p><strong>Total de Facturas:</strong> {reportData.numero_facturas}</p>
                        <hr />
                        <p><strong>Anticipo:</strong> Bs. {Number(anticipo || 0).toFixed(2)}</p>
                        <p><strong>Monto Total facturas:</strong> Bs. {reportData.monto_total_calculado.toFixed(2)}</p>
                        {(() => {
                            const diferencia = Number(anticipo || 0) - reportData.monto_total_calculado;
                            if (diferencia > 0) {
                                return <p className="fw-bold text-success"><strong>Diferencia a Pagar:</strong> Bs. {diferencia.toFixed(2)}</p>;
                            } else if (diferencia < 0) {
                                return <p className="fw-bold text-danger"><strong>Diferencia a Cobrar:</strong> Bs. {(-diferencia).toFixed(2)}</p>;
                            } else {
                                return <p className="fw-bold"><strong>Diferencia:</strong> Bs. 0.00</p>;
                            }
                        })()}
                        <hr />
                        <h6>Facturas Incluidas:</h6>
                        {reportData.facturas && reportData.facturas.length > 0 ? (
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>ID Factura</th>
                                        <th>Monto (Bs.)</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.facturas.map(factura => (
                                        <tr key={factura.id}>
                                            <td>{factura.id}</td>
                                            <td>{factura.montoTotal.toFixed(2)}</td>
                                            <td>{factura.fechaTransaccion}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No se encontraron facturas para este periodo.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;