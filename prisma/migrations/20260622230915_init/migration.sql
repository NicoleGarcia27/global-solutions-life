-- CreateTable
CREATE TABLE "Departamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Puesto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL DEFAULT '',
    "horario" TEXT NOT NULL DEFAULT 'Lun-Vie 9:00-18:00 / Sab 9:00-13:00',
    "escolaridad" TEXT NOT NULL DEFAULT 'Licenciatura',
    "experiencia" TEXT NOT NULL DEFAULT '',
    "edadMin" INTEGER NOT NULL DEFAULT 25,
    "edadMax" INTEGER NOT NULL DEFAULT 55,
    "reportaA" TEXT NOT NULL DEFAULT '',
    "supervisaA" TEXT NOT NULL DEFAULT '',
    "tiempoAdaptacion" TEXT NOT NULL DEFAULT '3 meses',
    "periodicidad" TEXT NOT NULL DEFAULT 'Mensual',
    "herramientas" TEXT NOT NULL DEFAULT '',
    "formacion" TEXT NOT NULL DEFAULT '',
    "competencias" TEXT NOT NULL DEFAULT '',
    "titular" TEXT NOT NULL DEFAULT '',
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "departamentoId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Puesto_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Responsabilidad" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "tiempoHoras" REAL NOT NULL DEFAULT 1,
    "recurrencia" TEXT NOT NULL DEFAULT 'Mensual',
    "nivel" TEXT NOT NULL DEFAULT 'Medio',
    "orden" INTEGER NOT NULL DEFAULT 0,
    "puestoId" INTEGER NOT NULL,
    CONSTRAINT "Responsabilidad_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Kpi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "area" TEXT NOT NULL,
    "metrica" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "actual" TEXT NOT NULL DEFAULT '',
    "unidad" TEXT NOT NULL DEFAULT '%',
    "frecuencia" TEXT NOT NULL DEFAULT 'Mensual',
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "puestoId" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Kpi_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Puesto_codigo_key" ON "Puesto"("codigo");
